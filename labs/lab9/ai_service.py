import os

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()


class ProjectExtraction(BaseModel):
    title: str
    summary: str
    technologies: list[str]


class ModelRefusedError(Exception):
    pass


class ProviderUnavailableError(Exception):
    pass


api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


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
