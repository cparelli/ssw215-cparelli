from pathlib import Path

from flask import Flask, render_template, send_from_directory

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
]


@app.route("/")
def index():
    return render_template("index.html", projects=projects_db)


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(Path(app.static_folder) / "assets", filename)


if __name__ == "__main__":
    app.run(debug=True)
