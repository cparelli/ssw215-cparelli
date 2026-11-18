import json
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from ai_service import (
    ModelRefusedError,
    ProviderUnavailableError,
    extract_project,
)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///portfolio.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
SEED_FILE = Path(__file__).with_name("projects_seed.json")
SEEDED_AUTHOR_NAME = "Catherine Parelli"


class Author(db.Model):
    __tablename__ = "authors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    projects = db.relationship("Project", backref="author")


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False, default="")
    likes = db.Column(db.Integer, nullable=False, default=0)
    summary = db.Column(db.Text, nullable=False, default="")
    technologies = db.Column(db.Text, nullable=False, default="")
    author_id = db.Column(db.Integer, db.ForeignKey("authors.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "likes": self.likes,
            "author_id": self.author_id,
            "author_name": self.author.name,
            "summary": self.summary,
            "technologies": [
                item.strip()
                for item in (self.technologies or "").split(",")
                if item.strip()
            ],
        }


def init_seed_data():
    if db.session.query(Project.id).first() is not None:
        return

    with SEED_FILE.open(encoding="utf-8") as seed_file:
        seed_projects = json.load(seed_file)

    author = Author(name=SEEDED_AUTHOR_NAME)
    db.session.add(author)
    for seed_project in seed_projects:
        db.session.add(
            Project(
                id=seed_project["id"],
                title=seed_project["title"],
                description=seed_project["description"],
                likes=seed_project["likes"],
                summary=seed_project["description"],
                technologies="",
                author=author,
            )
        )

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise


def ensure_project_columns():
    inspector = inspect(db.engine)
    if "projects" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("projects")}
    if "summary" not in existing_columns:
        db.session.execute(
            text("ALTER TABLE projects ADD COLUMN summary TEXT NOT NULL DEFAULT ''")
        )
    if "technologies" not in existing_columns:
        db.session.execute(
            text("ALTER TABLE projects ADD COLUMN technologies TEXT NOT NULL DEFAULT ''")
        )
    db.session.commit()


@app.route("/")
def index():
    projects = db.session.query(Project).order_by(Project.id).all()
    return render_template(
        "index.html",
        projects=[project.to_dict() for project in projects],
    )


@app.route("/api/projects", methods=["GET"])
def get_projects():
    projects = db.session.query(Project).order_by(Project.id).all()
    return jsonify([project.to_dict() for project in projects])


@app.route("/api/projects", methods=["POST"])
def create_project():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object with a title is required"}), 400

    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Title is required"}), 400

    author = db.session.query(Author).filter_by(name=SEEDED_AUTHOR_NAME).first()
    if author is None:
        return jsonify({"error": "Project author is not configured."}), 400

    project = Project(
        title=title.strip(),
        description="",
        likes=0,
        author=author,
    )
    db.session.add(project)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A project with this title already exists."}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Database error while saving project."}), 400

    return jsonify(project.to_dict()), 201


@app.route("/api/projects/smart", methods=["POST"])
def smart_create_project():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object with notes is required"}), 400

    notes = data.get("notes")
    if not isinstance(notes, str) or len(notes.strip()) < 20:
        return jsonify({"error": "Notes must contain at least 20 characters."}), 400

    try:
        extracted = extract_project(notes.strip())
    except ModelRefusedError as error:
        return jsonify({"error": str(error)}), 422
    except ProviderUnavailableError as error:
        return jsonify({"error": str(error)}), 503

    author = db.session.query(Author).filter_by(name=SEEDED_AUTHOR_NAME).first()
    if author is None:
        return jsonify({"error": "Project author is not configured."}), 400

    technologies = ", ".join(
        technology.strip()
        for technology in extracted.technologies
        if technology.strip()
    )
    project = Project(
        title=extracted.title.strip(),
        description=extracted.summary.strip(),
        summary=extracted.summary.strip(),
        technologies=technologies,
        likes=0,
        author=author,
    )
    db.session.add(project)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A project with this title already exists."}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Database error while saving project."}), 400

    return jsonify(project.to_dict()), 201


@app.route("/api/projects/<int:project_id>/upvote", methods=["POST"])
def upvote_project(project_id):
    project = db.session.get(Project, project_id)
    if project is None:
        return jsonify({"error": "Project not found"}), 404

    project.likes += 1
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Could not save upvote."}), 400

    return jsonify({"project_id": project_id, "likes": project.likes})


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(Path(app.static_folder) / "assets", filename)


with app.app_context():
    db.create_all()
    ensure_project_columns()
    init_seed_data()


if __name__ == "__main__":
    app.run(debug=True)
