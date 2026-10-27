from pathlib import Path

from flask import Flask, jsonify, render_template, send_from_directory

app = Flask(__name__)

projects_db = [
    {
        "id": 1,
        "title": "Laser Speckle Imaging",
        "description": (
            "I used MATLAB to collect and analyze images while studying "
            "changes in blood flow."
        ),
        "likes": 0,
    },
    {
        "id": 2,
        "title": "VR Myoelectric Control",
        "description": (
            "I helped process muscle signal data for a virtual reality "
            "research project."
        ),
        "likes": 0,
    },
    {
        "id": 3, # hand-edited by CP 
        "title": "3D Printed Bone Scaffold",
        "description": (
            "I designed a scaffold in SolidWorks and tested its mechanical performance using FEA analysis."
        ),
        "likes": 0,
    },
    {
        "id": 4, # hand-edited by CP 
        "title": "EEG Brainwave Analysis",
        "description": (
            "I analyzed EEG data to study brain activity during different cognitive tasks."
        ),
        "likes": 0,
    }
]


@app.route("/")
def index():
    return render_template("index.html", projects=projects_db)


@app.route("/api/projects/<int:project_id>/upvote", methods=["POST"])
def upvote_project(project_id):
    project = next(
        (project for project in projects_db if project["id"] == project_id),
        None,
    )
    if project is None:
        return jsonify({"error": "Project not found"}), 404

    project["likes"] += 1
    return jsonify({"project_id": project_id, "likes": project["likes"]})


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(Path(app.static_folder) / "assets", filename)


if __name__ == "__main__":
    app.run(debug=True)
