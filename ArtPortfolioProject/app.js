
/* artwork storage - Flask and SQLite */

let artworks = [];

function getArtworks() {
  return artworks;
}

function loadArtworks() {
  fetch("/api/artworks")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load artworks");
      }
      return response.json();
    })
    .then(function (data) {
      artworks = data;
      displayArtworks();
      displayManageArtwork();
    })
    .catch(function (error) {
      console.error("Error loading artworks:", error);
      alert("Could not load artwork from the database.");
    });
}


/* page elements */

const publicGallery = document.getElementById("artwork-gallery");
const artworkCount = document.getElementById("artwork-count");
const categoryFilter = document.getElementById("category-filter");

const artworkForm = document.getElementById("artwork-form");
const manageGallery = document.getElementById("manage-gallery");

const imageInput = document.getElementById("artwork-image");
const imagePreview = document.getElementById("image-preview");

const titleInput = document.getElementById("artwork-title");
const mediumInput = document.getElementById("artwork-medium");
const yearInput = document.getElementById("artwork-year");
const categoryInput = document.getElementById("artwork-category");
const notesInput = document.getElementById("artwork-notes");
const descriptionInput = document.getElementById("artwork-description");

const generateButton = document.getElementById("generate-description");
const saveButton = document.getElementById("save-artwork");

let editingArtworkId = null;


/* create artwork card */

function createArtworkCard(artwork) {
  const card = document.createElement("article");
  card.className = "artwork-card";

  const image = document.createElement("img");
  image.src = artwork.image;
  image.alt = artwork.title;

  const heading = document.createElement("h3");
  heading.textContent = artwork.title;

  const details = document.createElement("p");
  details.textContent = artwork.year
    ? `${artwork.medium} | ${artwork.year}`
    : artwork.medium;

  const description = document.createElement("p");
  description.textContent = artwork.description || "";

  card.appendChild(image);
  card.appendChild(heading);
  card.appendChild(details);
  card.appendChild(description);

  return card;
}


/* public gallery */

function displayArtworks() {
  if (!publicGallery || !artworkCount || !categoryFilter) {
    return;
  }

  const selectedTab = document.querySelector(".category-tab.active");
  const selectedCategory = selectedTab ? selectedTab.dataset.category : "all";

  publicGallery.innerHTML = "";

  let visibleCount = 0;

  getArtworks().forEach(function (artwork) {
    if (selectedCategory === "all" || artwork.category === selectedCategory) {
      const card = createArtworkCard(artwork);

      publicGallery.appendChild(card);
      visibleCount++;
    }
  });

  artworkCount.textContent = `Showing ${visibleCount} artworks`;
}

if (categoryFilter) {
  document.querySelectorAll(".category-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".category-tab").forEach(function (button) {
        button.classList.remove("active");
      });

      tab.classList.add("active");
      displayArtworks();
    });
  });
}


/* image preview */

if (imageInput && imagePreview) {
  imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (file) {
      imagePreview.src = URL.createObjectURL(file);
      imagePreview.hidden = false;
    } else if (editingArtworkId === null) {
      imagePreview.hidden = true;
      imagePreview.removeAttribute("src");
    }
  });
}


/* sample description generator */

if (generateButton) {
  generateButton.addEventListener("click", function () {
    const title = titleInput.value.trim();
    const medium = mediumInput.value.trim();
    const notes = notesInput.value.trim();

    if (!title || !medium) {
      alert("Please enter a title and medium first.");
      return;
    }

    let description = `"${title}" is an artwork created using ${medium}.`;

    if (notes !== "") {
      description += ` ${notes}`;
    }

    descriptionInput.value = description;
  });
}


/* reset form */

function resetArtworkForm() {
  editingArtworkId = null;

  artworkForm.reset();

  imagePreview.hidden = true;
  imagePreview.removeAttribute("src");

  saveButton.textContent = "Save Artwork";
}


/* add or update artwork */

if (artworkForm) {
  artworkForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const medium = mediumInput.value.trim();
    const year = yearInput.value;
    const category = categoryInput.value;
    const notes = notesInput.value.trim();
    const description = descriptionInput.value.trim();
    const file = imageInput.files[0];

    if (!title || !medium || !category) {
      alert("Please complete all required fields.");
      return;
    }

    const currentYear = new Date().getFullYear();

    if (year && (Number(year) < 1900 || Number(year) > currentYear)) {
      alert("Please enter a valid artwork year.");
      return;
    }

    if (file && !file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (editingArtworkId === null && !file) {
      alert("Please select an artwork image.");
      return;
    }

    function finishSaving(imageData) {
      let existingArtwork = null;

      if (editingArtworkId !== null) {
        existingArtwork = getArtworks().find(function (item) {
          return item.id === editingArtworkId;
        });

        if (!existingArtwork) {
          alert("Artwork not found.");
          return;
        }
      }

      const artworkData = {
        title: title,
        medium: medium,
        year: year,
        category: category,
        notes: notes,
        description: description,
        image: imageData || (existingArtwork ? existingArtwork.image : "")
      };

      let url = "/api/artworks";
      let method = "POST";

      if (editingArtworkId !== null) {
        url = `/api/artworks/${editingArtworkId}`;
        method = "PUT";
      }

      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(artworkData)
      })
        .then(function (response) {
          if (!response.ok) {
            return response.json().then(function (errorData) {
              throw new Error(errorData.error || "Could not save artwork");
            });
          }

          return response.json();
        })
        .then(function () {
          resetArtworkForm();
          loadArtworks();
        })
        .catch(function (error) {
          console.error("Error saving artwork:", error);
          alert(error.message);
        });
    }

    if (file) {
      const reader = new FileReader();

      reader.onload = function () {
        finishSaving(reader.result);
      };

      reader.onerror = function () {
        alert("Could not read the image.");
      };

      reader.readAsDataURL(file);
    } else {
      finishSaving(null);
    }
  });
}


/* artist management */

function displayManageArtwork() {
  if (!manageGallery) {
    return;
  }

  manageGallery.innerHTML = "";

  getArtworks().forEach(function (artwork) {
    const card = createArtworkCard(artwork);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit Artwork";

    editButton.addEventListener("click", function () {
      titleInput.value = artwork.title;
      mediumInput.value = artwork.medium;
      yearInput.value = artwork.year || "";
      categoryInput.value = artwork.category;
      notesInput.value = artwork.notes || "";
      descriptionInput.value = artwork.description || "";

      imageInput.value = "";
      imagePreview.src = artwork.image;
      imagePreview.hidden = false;

      editingArtworkId = artwork.id;
      saveButton.textContent = "Update Artwork";

      artworkForm.scrollIntoView({ behavior: "smooth" });
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete Artwork";

    deleteButton.addEventListener("click", function () {
      const confirmed = confirm(
        "Are you sure you want to delete this artwork?"
      );

      if (!confirmed) {
        return;
      }

      fetch(`/api/artworks/${artwork.id}`, {
        method: "DELETE"
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Could not delete artwork");
          }

          if (editingArtworkId === artwork.id) {
            resetArtworkForm();
          }

          loadArtworks();
        })
        .catch(function (error) {
          console.error("Error deleting artwork:", error);
          alert("Could not delete artwork.");
        });
    });

    card.appendChild(editButton);
    card.appendChild(deleteButton);

    manageGallery.appendChild(card);
  });
}


/* load artwork from SQLite */

loadArtworks();
