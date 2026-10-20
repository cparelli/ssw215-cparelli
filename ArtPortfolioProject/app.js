
/* artwork storage */

const storageKey = "artworks";
const starterKey = "starterArtworksLoaded";

function getArtworks() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveArtworks(artworks) {
  localStorage.setItem(storageKey, JSON.stringify(artworks));
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

  const artworks = getArtworks();
  const selectedCategory = categoryFilter.value;

  publicGallery.innerHTML = "";

  let visibleCount = 0;

  artworks.forEach(function (artwork) {
    if (selectedCategory === "all" || artwork.category === selectedCategory) {
      const card = createArtworkCard(artwork);

      publicGallery.appendChild(card);
      visibleCount++;
    }
  });

  artworkCount.textContent = `Showing ${visibleCount} artworks`;
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", displayArtworks);
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
      const artworks = getArtworks();

      if (editingArtworkId !== null) {
        const artwork = artworks.find(function (item) {
          return item.id === editingArtworkId;
        });

        if (!artwork) {
          alert("Artwork not found.");
          return;
        }

        artwork.title = title;
        artwork.medium = medium;
        artwork.year = year;
        artwork.category = category;
        artwork.notes = notes;
        artwork.description = description;

        if (imageData) {
          artwork.image = imageData;
        }

      } else {
        artworks.push({
          id: Date.now(),
          title: title,
          medium: medium,
          year: year,
          category: category,
          notes: notes,
          description: description,
          image: imageData
        });
      }

      try {
        saveArtworks(artworks);
      } catch (error) {
        alert("Could not save artwork. Try a smaller image.");
        return;
      }

      resetArtworkForm();
      displayManageArtwork();
      displayArtworks();
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

  const artworks = getArtworks();

  manageGallery.innerHTML = "";

  artworks.forEach(function (artwork) {
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

      const updatedArtworks = getArtworks().filter(function (item) {
        return item.id !== artwork.id;
      });

      try {
        saveArtworks(updatedArtworks);
      } catch (error) {
        alert("Could not delete artwork.");
        return;
      }

      if (editingArtworkId === artwork.id) {
        resetArtworkForm();
      }

      displayManageArtwork();
      displayArtworks();
    });

    card.appendChild(editButton);
    card.appendChild(deleteButton);

    manageGallery.appendChild(card);
  });
}


/* load starter artwork only once */

function loadStarterArtwork() {
  if (localStorage.getItem(starterKey) === "true") {
    displayArtworks();
    displayManageArtwork();
    return;
  }

  fetch("mock_data.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load mock_data.json");
      }

      return response.json();
    })
    .then(function (data) {
      const artworks = getArtworks();

      data.artworks.forEach(function (starterArtwork) {
        const exists = artworks.some(function (artwork) {
          return artwork.id === starterArtwork.id;
        });

        if (!exists) {
          artworks.push(starterArtwork);
        }
      });

      saveArtworks(artworks);
      localStorage.setItem(starterKey, "true");

      displayArtworks();
      displayManageArtwork();
    })
    .catch(function (error) {
      console.error("Error loading starter artwork:", error);
      alert("Could not load starter artwork. Check the local server.");
    });
}

loadStarterArtwork();
