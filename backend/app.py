import json
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/")
def home():
    return "Hello world!"


@app.route("/img", methods=["POST"])
def process_image():
    path = "C:/Users/alter/OneDrive/Desktop/mapData.json"

    with open(path, "w") as file:
        json.dump(request.json, file, indent=2)

    return "good job!"


app.run()
