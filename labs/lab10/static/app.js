const filterInput = document.getElementById("filter-input");
const projectCount = document.getElementById("project-count");
const projectGrid = document.querySelector(".project-grid");
const newTitleInput = document.getElementById("new-title");
const addProjectButton = document.getElementById("add-project-btn");
const createProjectStatus = document.getElementById("create-project-status");
const smartNotes = document.getElementById("smart-notes");
const smartCreateButton = document.getElementById("smart-create-btn");
const smartCreateStatus = document.getElementById("smart-create-status");
const githubImportForm = document.getElementById("github-import-form");
const githubImportStatus = document.getElementById("github-import-status");
const githubDraftPanel = document.getElementById("github-draft-panel");
const githubFeedback = document.getElementById("github-feedback");
const githubSendFeedback = document.getElementById("github-send-feedback");
const githubRefineBlind = document.getElementById("github-refine-blind");
const githubApprove = document.getElementById("github-approve");
const githubDraftStatus = document.getElementById("github-draft-status");
const githubDraftTitle = document.getElementById("github-draft-title");
const githubDraftSummary = document.getElementById("github-draft-summary");
const githubDraftTechnologies = document.getElementById("github-draft-technologies");
const githubDraftDifficulty = document.getElementById("github-draft-difficulty");
let githubSessionId = null;

if (!(filterInput instanceof HTMLInputElement)) {
  throw new Error('Expected an input with id="filter-input".');
}

if (!projectCount || !projectGrid) {
  throw new Error("Expected project count and project grid elements.");
}

if (!(newTitleInput instanceof HTMLInputElement)
  || !(addProjectButton instanceof HTMLButtonElement)
  || !createProjectStatus) {
  throw new Error("Expected the project creation controls.");
}

if (!(smartNotes instanceof HTMLTextAreaElement)
  || !(smartCreateButton instanceof HTMLButtonElement)
  || !smartCreateStatus) {
  throw new Error("Expected the smart create controls.");
}

if (!(githubImportForm instanceof HTMLFormElement)
  || !githubImportStatus
  || !githubDraftPanel
  || !(githubFeedback instanceof HTMLTextAreaElement)
  || !(githubSendFeedback instanceof HTMLButtonElement)
  || !(githubRefineBlind instanceof HTMLButtonElement)
  || !(githubApprove instanceof HTMLButtonElement)
  || !githubDraftStatus
  || !githubDraftTitle
  || !githubDraftSummary
  || !githubDraftTechnologies
  || !githubDraftDifficulty) {
  throw new Error("Expected the GitHub import controls.");
}

function showGithubDraft(draft) {
  if (typeof draft.title !== "string" || typeof draft.summary !== "string"
    || !Array.isArray(draft.technologies)
    || !["Beginner", "Intermediate", "Advanced"].includes(draft.difficulty)) {
    throw new Error("GitHub draft did not contain valid project details.");
  }
  githubDraftTitle.textContent = draft.title;
  githubDraftSummary.textContent = draft.summary;
  githubDraftTechnologies.textContent = draft.technologies.join(", ");
  githubDraftDifficulty.textContent = draft.difficulty;
  githubDraftPanel.classList.remove("hidden");
}

async function readError(response, fallback) {
  const result = await response.json().catch(() => ({}));
  return result.error || `${fallback} (status ${response.status}).`;
}

function filterProjects() {
  const query = filterInput.value.trim().toLowerCase();
  const projectCards = Array.from(projectGrid.querySelectorAll(".card"));
  let visibleCount = 0;
  const visibleTitles = [];

  projectCards.forEach((card) => {
    const matches = card.textContent.toLowerCase().includes(query);
    card.classList.toggle("hidden", !matches);
    if (matches) {
      visibleCount += 1;
      const title = card.querySelector("h3");
      if (title) {
        visibleTitles.push(title.textContent.trim());
      }
    }
  });

  projectCount.textContent = `Showing ${visibleCount} of ${projectCards.length} projects`;
  console.log(visibleTitles);
}

function updateTrendingBadge(card, likes) {
  const badge = card.querySelector(".badge");
  if (likes > 10 && !badge) {
    const newBadge = document.createElement("span");
    newBadge.className = "badge";
    newBadge.textContent = "Trending";
    card.querySelector(".like-details")?.append(newBadge);
  } else if (likes <= 10 && badge) {
    badge.remove();
  }
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.projectId = String(project.id);

  const title = document.createElement("h3");
  title.textContent = project.title;

  const author = document.createElement("p");
  author.className = "project-author";
  author.textContent = `By ${project.author_name}`;

  const description = document.createElement("p");
  description.textContent = project.description;

  if (Array.isArray(project.technologies) && project.technologies.length > 0) {
    const technologies = document.createElement("p");
    technologies.className = "project-technologies";
    technologies.textContent = `Technologies: ${project.technologies.join(", ")}`;
    card.append(title, author, description, technologies);
  }

  const likeDetails = document.createElement("p");
  likeDetails.className = "like-details";
  const likeCount = document.createElement("span");
  likeCount.className = "like-count";
  likeCount.textContent = String(project.likes);
  likeDetails.append(likeCount, document.createTextNode(" likes"));

  if (project.likes > 10) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "Trending";
    likeDetails.append(badge);
  }

  const upvoteButton = document.createElement("button");
  upvoteButton.className = "upvote-btn";
  upvoteButton.type = "button";
  upvoteButton.textContent = "Upvote";

  if (!Array.isArray(project.technologies) || project.technologies.length === 0) {
    card.append(title, author, description);
  }
  card.append(likeDetails, upvoteButton);
  return card;
}

filterInput.addEventListener("input", filterProjects);
filterProjects();

projectGrid.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest(".upvote-btn");
  if (!button || !projectGrid.contains(button)) {
    return;
  }

  const card = button.closest(".card");
  const likeCount = card?.querySelector(".like-count");
  const projectId = card?.dataset.projectId;

  if (!card || !likeCount || !projectId) {
    console.error("Unable to find the project card or like count for this upvote.");
    return;
  }

  button.disabled = true;
  try {
    const response = await fetch(`/api/projects/${projectId}/upvote`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Upvote request failed with status ${response.status}.`);
    }

    const result = await response.json();
    if (!Number.isInteger(result.likes)) {
      throw new Error("Upvote response did not contain a valid like count.");
    }

    likeCount.textContent = String(result.likes);
    updateTrendingBadge(card, result.likes);
  } catch (error) {
    console.error("Unable to upvote project.", error);
  } finally {
    button.disabled = false;
  }
});

addProjectButton.addEventListener("click", async () => {
  addProjectButton.disabled = true;
  createProjectStatus.textContent = "";
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitleInput.value }),
    });
    if (!response.ok) {
      throw new Error(`Create project request failed with status ${response.status}.`);
    }

    if (response.status !== 201) {
      throw new Error(`Expected a 201 response, received ${response.status}.`);
    }

    const project = await response.json();
    if (!Number.isInteger(project.id) || typeof project.title !== "string"
      || typeof project.description !== "string" || !Number.isInteger(project.likes)
      || typeof project.author_name !== "string") {
      throw new Error("Create project response did not contain a valid project.");
    }

    projectGrid.append(createProjectCard(project));
    newTitleInput.value = "";
    createProjectStatus.textContent = `Added "${project.title}".`;
    filterProjects();
  } catch (error) {
    createProjectStatus.textContent = error.message;
    console.error("Unable to create project.", error);
  } finally {
    addProjectButton.disabled = false;
  }
});

smartCreateButton.addEventListener("click", async () => {
  smartCreateButton.disabled = true;
  smartCreateStatus.textContent = "";
  try {
    const response = await fetch("/api/projects/smart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: smartNotes.value }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Smart create failed." }));
      throw new Error(error.error || `Smart create failed with status ${response.status}.`);
    }

    if (response.status !== 201) {
      throw new Error(`Expected a 201 response, received ${response.status}.`);
    }

    const project = await response.json();
    if (!Number.isInteger(project.id) || typeof project.title !== "string"
      || typeof project.summary !== "string" || !Array.isArray(project.technologies)) {
      throw new Error("Smart create response did not contain valid project details.");
    }

    projectGrid.append(createProjectCard(project));
    smartNotes.value = "";
    smartCreateStatus.textContent = `Added "${project.title}".`;
    filterProjects();
  } catch (error) {
    smartCreateStatus.textContent = error.message;
    console.error("Unable to smart create project.", error);
  } finally {
    smartCreateButton.disabled = false;
  }
});

githubImportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ownerInput = document.getElementById("repo-owner");
  const repoInput = document.getElementById("repo-name");
  if (!(ownerInput instanceof HTMLInputElement) || !(repoInput instanceof HTMLInputElement)) {
    throw new Error("Expected GitHub repository owner and name inputs.");
  }

  const submitButton = githubImportForm.querySelector('button[type="submit"]');
  if (!(submitButton instanceof HTMLButtonElement)) {
    throw new Error("Expected the GitHub import submit button.");
  }

  submitButton.disabled = true;
  githubImportStatus.textContent = "";
  githubDraftStatus.textContent = "";
  try {
    const response = await fetch("/api/projects/git-start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: ownerInput.value, repo: repoInput.value }),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "GitHub import failed"));
    }

    const result = await response.json();
    if (response.status !== 201 || typeof result.session_id !== "string") {
      throw new Error("GitHub import response did not contain a valid draft session.");
    }
    githubSessionId = result.session_id;
    showGithubDraft(result.draft);
    githubImportStatus.textContent = "Review the draft and send feedback or approve it.";
  } catch (error) {
    githubImportStatus.textContent = error.message;
    console.error("Unable to fetch GitHub project draft.", error);
  } finally {
    submitButton.disabled = false;
  }
});

githubSendFeedback.addEventListener("click", async () => {
  if (!githubSessionId) {
    githubDraftStatus.textContent = "Fetch a draft before sending feedback.";
    return;
  }

  githubSendFeedback.disabled = true;
  githubDraftStatus.textContent = "";
  try {
    const response = await fetch("/api/projects/git-refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: githubSessionId,
        feedback: githubFeedback.value,
      }),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Draft refinement failed"));
    }

    showGithubDraft(await response.json());
    githubFeedback.value = "";
    githubDraftStatus.textContent = "Draft updated.";
  } catch (error) {
    githubDraftStatus.textContent = error.message;
    console.error("Unable to refine GitHub project draft.", error);
  } finally {
    githubSendFeedback.disabled = false;
  }
});

githubRefineBlind.addEventListener("click", async () => {
  if (!githubSessionId) {
    githubDraftStatus.textContent = "Fetch a draft before refining it.";
    return;
  }

  githubRefineBlind.disabled = true;
  githubDraftStatus.textContent = "";
  try {
    const response = await fetch("/api/projects/git-refine-blind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: githubSessionId,
        feedback: githubFeedback.value,
      }),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Blind draft refinement failed"));
    }

    showGithubDraft(await response.json());
    githubFeedback.value = "";
    githubDraftStatus.textContent = "Blind draft displayed.";
  } catch (error) {
    githubDraftStatus.textContent = error.message;
    console.error("Unable to refine GitHub project draft without history.", error);
  } finally {
    githubRefineBlind.disabled = false;
  }
});

githubApprove.addEventListener("click", async () => {
  if (!githubSessionId) {
    githubDraftStatus.textContent = "Fetch a draft before approving it.";
    return;
  }

  githubApprove.disabled = true;
  githubDraftStatus.textContent = "";
  try {
    const response = await fetch("/api/projects/git-commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: githubSessionId }),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Saving the project failed"));
    }
    if (response.status !== 201) {
      throw new Error(`Expected a 201 response, received ${response.status}.`);
    }

    const project = await response.json();
    if (!Number.isInteger(project.id) || typeof project.title !== "string"
      || typeof project.description !== "string" || !Number.isInteger(project.likes)
      || typeof project.author_name !== "string") {
      throw new Error("Saved project response did not contain a valid project.");
    }
    projectGrid.append(createProjectCard(project));
    githubDraftPanel.classList.add("hidden");
    githubSessionId = null;
    githubImportStatus.textContent = `Saved "${project.title}".`;
    filterProjects();
  } catch (error) {
    githubDraftStatus.textContent = error.message;
    console.error("Unable to save GitHub project draft.", error);
  } finally {
    githubApprove.disabled = false;
  }
});
