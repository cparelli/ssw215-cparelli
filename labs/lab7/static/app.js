const filterInput = document.getElementById("filter-input");
const projectCount = document.getElementById("project-count");
const projectGrid = document.querySelector(".project-grid");
const newTitleInput = document.getElementById("new-title");
const addProjectButton = document.getElementById("add-project-btn");
const createProjectStatus = document.getElementById("create-project-status");

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

  const description = document.createElement("p");
  description.textContent = project.description;

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

  card.append(title, description, likeDetails, upvoteButton);
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
      || typeof project.description !== "string" || !Number.isInteger(project.likes)) {
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
