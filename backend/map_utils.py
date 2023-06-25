import json
from io import BytesIO
import base64
from typing import Dict, List

from PIL import Image
from shapely.geometry import shape, Polygon
from shapely.ops import unary_union


def save_image(image_data: str, name: str = "tmp_image"):
    image_data = image_data.split(",")[-1]
    image_binary = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_binary))
    image.save(f"assets/{name}.png", "PNG")


def save_json(data: Dict, name: str = "tmp_json"):
    path = f"assets/{name}.json"
    try:
        data.pop("image")
    except KeyError:
        pass

    with open(path, "w") as file:
        json.dump(data, file, indent=2)


def union_geojsons(objects: List[Dict]):
    shapely_geoms = [shape(obj["geometry"]) for obj in objects]

    return unary_union(shapely_geoms)


def get_distance_data(map: Dict):
    buildings: Dict = {shape["id"]: shape for shape in map["buildings"]}
    grees_multipoly = union_geojsons(map["green"])

    buildings_with_distance = {}

    for id, building in buildings.items():
        building_poly: Polygon = shape(building["geometry"])
        distance = building_poly.distance(grees_multipoly)
        building["distance"] = distance
        buildings_with_distance[id] = building

    return buildings_with_distance
