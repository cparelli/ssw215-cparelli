import base64
import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()


class RepositoryNotFoundError(Exception):
    pass


class GitHubUnavailableError(Exception):
    pass


def fetch_repository_readme(owner, repo):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = (
        "https://api.github.com/repos/"
        f"{quote(owner, safe='')}/{quote(repo, safe='')}/readme"
    )
    try:
        response = requests.get(url, headers=headers, timeout=8)
    except requests.RequestException as error:
        raise GitHubUnavailableError("Could not reach GitHub.") from error

    if response.status_code == 404:
        raise RepositoryNotFoundError("Repository or README not found.")
    if response.status_code != 200:
        raise GitHubUnavailableError(
            f"GitHub returned status {response.status_code}."
        )

    try:
        content = response.json()["content"]
        readme = base64.b64decode(content).decode("utf-8")
    except (KeyError, TypeError, ValueError, UnicodeDecodeError) as error:
        raise GitHubUnavailableError("GitHub returned an unreadable README.") from error

    return readme[:4000]
