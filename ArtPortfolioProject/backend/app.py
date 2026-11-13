
import json
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///portfolio.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Artwork(db.Model):
    __tablename__ = "artworks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    image = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    medium = db.Column(db.String(120), nullable=False)
    year = db.Column(db.String(4), nullable=True)
    notes = db.Column(db.Text, nullable=False, default="")
    description = db.Column(db.Text, nullable=False, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "image": self.image,
            "category": self.category,
            "medium": self.medium,
            "year": self.year,
            "notes": self.notes,
            "description": self.description,
        }


def init_seed_data():
    if db.session.query(Artwork.id).first() is not None:
        return

    seed_file = Path(__file__).with_name("mock_data.json")

    with seed_file.open(encoding="utf-8") as file:
        seed_data = json.load(file)

    for artwork in seed_data["artworks"]:
        db.session.add(Artwork(
            id=artwork["id"],
            title=artwork["title"],
            image=artwork["image"],
            category=artwork["category"],
            medium=artwork["medium"],
            year=artwork["year"],
            notes=artwork["notes"],
            description=artwork["description"]
        ))

    db.session.commit()


@app.route("/")
def index():
    return send_from_directory("..", "index.html")


@app.route("/index.html")
def gallery_page():
    return send_from_directory("..", "index.html")


@app.route("/artist.html")
def artist_page():
    return send_from_directory("..", "artist.html")


@app.route("/style.css")
def styles():
    return send_from_directory("..", "style.css")


@app.route("/app.js")
def javascript():
    return send_from_directory("..", "app.js")


@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory("../images", filename)


@app.route("/api/artworks", methods=["GET"])
def get_artworks():
    artworks = db.session.query(Artwork).order_by(Artwork.id).all()
    return jsonify([artwork.to_dict() for artwork in artworks]), 200


@app.route("/api/artworks", methods=["POST"])
def create_artwork():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required"}), 400

    title = data.get("title")
    medium = data.get("medium")
    category = data.get("category")
    image = data.get("image")

    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Title is required"}), 400

    if not isinstance(medium, str) or not medium.strip():
        return jsonify({"error": "Medium is required"}), 400

    if not isinstance(category, str) or not category.strip():
        return jsonify({"error": "Category is required"}), 400

    if not isinstance(image, str) or not image.strip():
        return jsonify({"error": "Image is required"}), 400

    year = data.get("year", "")
    notes = data.get("notes", "")
    description = data.get("description", "")

    if not isinstance(year, str) or not isinstance(notes, str) or not isinstance(description, str):
        return jsonify({"error": "Invalid artwork information"}), 400

    if year.strip():
        if not year.isdigit() or len(year) != 4 or int(year) < 1900 or int(year) > 2026:
            return jsonify({"error": "Invalid year"}), 400

    artwork = Artwork(
        title=title.strip(),
        medium=medium.strip(),
        category=category.strip(),
        image=image.strip(),
        year=year.strip(),
        notes=notes.strip(),
        description=description.strip()
    )

    db.session.add(artwork)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Could not save artwork"}), 400

    return jsonify(artwork.to_dict()), 201


@app.route("/api/artworks/<int:artwork_id>", methods=["PUT"])
def update_artwork(artwork_id):
    artwork = db.session.get(Artwork, artwork_id)

    if artwork is None:
        return jsonify({"error": "Artwork not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required"}), 400

    for field in ["title", "medium", "category", "image"]:
        value = data.get(field)

        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": field + " is required"}), 400

    year = data.get("year", "")
    notes = data.get("notes", "")
    description = data.get("description", "")

    if not isinstance(year, str) or not isinstance(notes, str) or not isinstance(description, str):
        return jsonify({"error": "Invalid artwork information"}), 400

    if year.strip():
        if not year.isdigit() or len(year) != 4 or int(year) < 1900 or int(year) > 2026:
            return jsonify({"error": "Invalid year"}), 400

    artwork.title = data["title"].strip()
    artwork.medium = data["medium"].strip()
    artwork.category = data["category"].strip()
    artwork.image = data["image"].strip()
    artwork.year = year.strip()
    artwork.notes = notes.strip()
    artwork.description = description.strip()

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Could not update artwork"}), 400

    return jsonify(artwork.to_dict()), 200


@app.route("/api/artworks/<int:artwork_id>", methods=["DELETE"])
def delete_artwork(artwork_id):
    artwork = db.session.get(Artwork, artwork_id)

    if artwork is None:
        return jsonify({"error": "Artwork not found"}), 404

    db.session.delete(artwork)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Could not delete artwork"}), 400

    return jsonify({"message": "Artwork deleted"}), 200


with app.app_context():
    db.create_all()
    init_seed_data()


if __name__ == "__main__":
    app.run(debug=True)
