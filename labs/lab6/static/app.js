const filterInput = document.getElementById("filter-input");
const projectCount = document.getElementById("project-count");
const projectCards = Array.from(document.querySelectorAll(".card"));

if (!(filterInput instanceof HTMLInputElement)) {
  throw new Error('Expected an input with id="filter-input".');
}

if (!projectCount) {
  throw new Error('Expected an element with id="project-count".');
}

function filterProjects() {
  const query = filterInput.value.trim().toLowerCase(); // hand-edited by CP 
  let visibleCount = 0;
  const visibleTitles = [];

  projectCards.forEach((card) => {
    const matches = card.textContent.toLowerCase().includes(query); // hand-edited by CP 
    card.classList.toggle("hidden", !matches);
    if (matches) {
      visibleCount += 1;
      visibleTitles.push(card.querySelector("h3").textContent.trim());
    }
  });

  projectCount.textContent = `Showing ${visibleCount} of ${projectCards.length} projects`;
  console.log(visibleTitles);
}

filterInput.addEventListener("input", filterProjects);
filterProjects();

document.querySelectorAll(".upvote-btn").forEach((button) => {
  button.addEventListener("click", async () => {
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
    } catch (error) {
      console.error("Unable to upvote project.", error);
    } finally {
      button.disabled = false;
    }
  });
});
