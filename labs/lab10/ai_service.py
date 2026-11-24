import os
import uuid
from typing import Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()


class ProjectExtraction(BaseModel):
    title: str
    summary: str
    technologies: list[str]


class GitHubProjectDraft(BaseModel):
    title: str
    summary: str
    technologies: list[str]
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]


class ModelRefusedError(Exception):
    pass


class ProviderUnavailableError(Exception):
    pass


class DraftNotFoundError(Exception):
    pass


api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None
github_sessions = {}


def extract_project(notes):
    if client is None:
        raise ProviderUnavailableError("The AI provider is not configured.")

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            temperature=0.1,
            messages=[
                {
                    "role": "system",
                    "content": "Extract a concise portfolio project title, a one-or-two-sentence summary, and the technologies used.",
                },
                {"role": "user", "content": notes},
            ],
            response_format=ProjectExtraction,
        )
        choice = completion.choices[0]
        message = choice.message
        if getattr(message, "refusal", None):
            raise ModelRefusedError(message.refusal)
        if message.parsed is None:
            raise ModelRefusedError("The model did not provide structured project details.")
        return message.parsed
    except (ModelRefusedError, ProviderUnavailableError):
        raise
    except Exception as error:
        raise ProviderUnavailableError(str(error)) from error


def _request_github_draft(messages):
    if client is None:
        raise ProviderUnavailableError("The AI provider is not configured.")

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            temperature=0.1,
            messages=messages,
            response_format=GitHubProjectDraft,
        )
        message = completion.choices[0].message
        if getattr(message, "refusal", None):
            raise ModelRefusedError(message.refusal)
        if message.parsed is None:
            raise ModelRefusedError("The model did not provide structured project details.")
        return message.parsed
    except (ModelRefusedError, ProviderUnavailableError):
        raise
    except Exception as error:
        raise ProviderUnavailableError(str(error)) from error


def start_github_session(readme):
    messages = [
        {
            "role": "system",
            "content": (
                "Create a concise portfolio project draft from the repository README. "
                "Return a short title, a one-or-two-sentence summary, a list of "
                "technologies, and difficulty exactly Beginner, Intermediate, or Advanced."
            ),
        },
        {"role": "user", "content": readme},
    ]
    draft = _request_github_draft(messages)
    session_id = str(uuid.uuid4())
    github_sessions[session_id] = {
        "draft": draft,
        "messages": messages + [
            {"role": "assistant", "content": draft.model_dump_json()}
        ],
    }
    return session_id, draft


def refine_github_session(session_id, feedback):
    session = github_sessions.get(session_id)
    if session is None:
        raise DraftNotFoundError("Draft session not found.")

    messages = session["messages"] + [{"role": "user", "content": feedback}]
    draft = _request_github_draft(messages)
    session["messages"] = messages + [
        {"role": "assistant", "content": draft.model_dump_json()}
    ]
    session["draft"] = draft
    return draft


def refine_github_session_blind(session_id, feedback):
    if session_id not in github_sessions:
        raise DraftNotFoundError("Draft session not found.")

    return _request_github_draft([
        {"role": "user", "content": feedback}
    ])


def get_github_draft(session_id):
    session = github_sessions.get(session_id)
    if session is None:
        raise DraftNotFoundError("Draft session not found.")
    return session["draft"]


def clear_github_session(session_id):
    if session_id not in github_sessions:
        raise DraftNotFoundError("Draft session not found.")
    del github_sessions[session_id]
