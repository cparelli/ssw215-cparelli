import json
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

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
    author_id = db.Column(db.Integer, db.ForeignKey("authors.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "likes": self.likes,
            "author_id": self.author_id,
            "author_name": self.author.name,
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
                author=author,
            )
        )

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise


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
    init_seed_data()


if __name__ == "__main__":
    app.run(debug=True)
