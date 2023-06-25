from flask import Flask, request
from flask_cors import CORS
from map_utils import save_image, save_json, get_distance_data

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/")
def home():
    return "Hello world!"


@app.route("/img", methods=["POST"])
def process_image():
    save_image(request.json["image"], "input_image")
    save_json(request.json, "input_data")
    buildings_with_distance = get_distance_data(request.json)
    save_json(buildings_with_distance, "output_data")

    return buildings_with_distance


app.run()
