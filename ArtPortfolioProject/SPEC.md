
# Art Portfolio Website

## Project Overview
- Art portfolio website where an individual artist can upload and organize their artwork into a virtual galler
- The artist will be able to enter information about each piece, generate a short description based on their notes, and save it to the gallery
- visitors can browse the artwork by category and contact the artist through email, but cannot make changes to the gallery 

## Rule of Ones
- Target User: One individual artist who wants to organize and display their artwork.
- Main Problem: The artist needs a simple way to upload, organize, and display their work.
- Main Workflow: Add artwork → Enter information → Generate description → Review and save → Display in gallery.
- Future Database: One Artworks table with id, title, image, category, medium, year, notes, and description.
- Future AI Feature: One AI call that generates a short description based on the artwork information and notes.

## Sprint 1: Frontend

### Requirements

1. The website MUST have a public gallery page and a separate page for the artist to manage their artwork.
2. The artist MUST be able to select an image and enter the title, medium, year, category, and notes.
3. The artist MUST be able to generate a sample description and edit it before saving.
4. The artist MUST be able to add, edit, and delete artwork.
5. The gallery MUST display the artwork with its image and information.
6. Visitors MUST be able to filter artwork by category, such as drawings, oil paintings, and acrylic paintings.
7. The public gallery MUST NOT display Add, Edit, or Delete buttons.
8. The website MUST update the displayed artwork when changes are made.
9. The artist MUST complete the required fields before saving.
10. The website MUST work on computers and smaller screens.
11. The website MUST load its starting artwork from mock_data.json.
12. The website MUST use HTML, CSS, and JavaScript.

### Sprint 1 Limitations

For Sprint 1, I am only creating the frontend of the website. The artwork will start with sample data, and any changes made by the artist will be temporary. The description generator will be a demonstration instead of using a real AI API.

I will not be adding a database, backend, or artist login yet. The artist page will be separate from the public gallery, but it will not be password protected during this sprint.

The website will not include visitor accounts, comments, likes, payments, or direct messaging.

### Sprint 1 Checklist

- [ ] The gallery page opens correctly.
- [ ] The artist page opens correctly.
- [ ] Sample artwork loads from mock_data.json.
- [ ] The artist can select and preview an image.
- [ ] The artist can enter artwork information.
- [ ] The sample description button works.
- [ ] The artist can review and edit the description.
- [ ] The artist can add artwork to the gallery.
- [ ] The artist can edit and delete artwork.
- [ ] The gallery updates when artwork is changed.
- [ ] Visitors can filter artwork by category.
- [ ] Visitors cannot see editing buttons.
- [ ] Required fields are checked before saving.
- [ ] The website works on different screen sizes.
- [ ] There are no errors in the browser console.

## Future Sprints

Sprint 2 will add the backend and database so artwork can be saved permanently.

Sprint 3 will connect the website to an AI API to generate descriptions.