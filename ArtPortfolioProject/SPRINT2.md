
# Sprint 2: Persistent Backend, API Contracts & Relational Database

## Project Recap

My project is an art portfolio website where an artist can display and manage their artwork. The public can view the gallery and filter artwork by category, while the artist can add, edit, and delete artwork. In Sprint 2, I connected the frontend to a Flask backend and SQLite database so artwork is saved even after the server restarts.

## API Contract

| Endpoint | Method | Request | Success | Error |
|---|---|---|---|---|
| `/api/artworks` | GET | None | 200 - Returns all artwork | 500 - Server error |
| `/api/artworks` | POST | JSON with title, medium, category, image, year, notes, description | 201 - Returns new artwork with ID | 400 - Invalid input; 500 - Database error |
| `/api/artworks/<artwork_id>` | PUT | JSON with updated artwork fields | 200 - Returns updated artwork | 400 - Invalid input; 404 - Artwork not found; 500 - Database error |
| `/api/artworks/<artwork_id>` | DELETE | None | 204 - Artwork deleted | 404 - Artwork not found; 500 - Database error |

The backend validates required fields before saving artwork. The title, medium, category, and image cannot be empty. The year is optional, but if provided, it must be a valid four-digit year between 1900 and 2026.

## Database Schema

The project uses SQLite with Flask-SQLAlchemy. The database contains an `artworks` table.

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key, automatically generated |
| title | String(120) | Required artwork title |
| image | Text | Required image path or image data |
| category | String(80) | Required artwork category |
| medium | String(120) | Required artwork medium |
| year | String(4) | Optional artwork year |
| notes | Text | Additional artwork notes |
| description | Text | Artwork description |

SQLAlchemy handles creating, retrieving, updating, and deleting records in SQLite.

## How to Run and Test

1. Clone the repository and open the `ArtPortfolioProject` folder.
2. Install the dependencies using `pip install -r backend/requirements.txt`.
3. Navigate to the backend folder using `cd backend` and start Flask with `py app.py`.
4. Open `http://127.0.0.1:5000/` to view the gallery and `http://127.0.0.1:5000/artist.html` to add, edit, or delete artwork.

To test persistence, add an artwork, stop the server using Ctrl+C, restart Flask, and refresh the website. The artwork should still appear because it is stored in SQLite.

## Testing

I tested loading the original artwork, adding a new artwork, editing its title, and deleting artwork. I also restarted the Flask server to make sure the changes were saved. The gallery and artist management page both loaded correctly, and the frontend updated using requests to the backend.

## AI Usage and Reflection
I used GitHub Copilot to help modify parts of my code throughout Sprint 2. I mainly used ChatGPT to troubleshoot errors, explain concepts I was confused about, and help me understand how to connect the frontend, backend, and database. I tested the changes myself to make sure the website worked correctly.

For Sprint 2, I chose to use SQLite directly instead of first building a JSON-based backend. In our earlier labs, we manually read and wrote data to JSON files, but SQLite allows the application to store and update records in a database. This made it easier to manage artwork and keep changes saved even after restarting Flask. I also gained a better understanding of how API requests allow the frontend to communicate with the backend.
