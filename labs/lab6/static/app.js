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
    card.classList.toggle("is-hidden", !matches); // hand-edited by CP 
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
