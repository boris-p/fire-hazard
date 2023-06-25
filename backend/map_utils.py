import json
from io import BytesIO
import base64
from typing import Dict, List, Tuple

from PIL import Image
from shapely.geometry import shape, Polygon, Point
from shapely.ops import unary_union
from shapely import to_geojson

from distance_to_fire_station import get_distance_from_fire_station


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


def __union_geojsons(objects: List[Dict]):
    shapely_geoms = [shape(obj["geometry"]) for obj in objects]

    return unary_union(shapely_geoms)


def __add_building_to_green_distance(buildings: Dict, green: List[Dict]):
    greens_multipoly = __union_geojsons(green)

    buildings_with_distance = {}

    all_distances = {
        id: shape(building["geometry"]).distance(greens_multipoly)
        for id, building in buildings.items()
    }

    max_distance = max(list(all_distances.values()))

    for id, building in buildings.items():
        building["green_distance"] = all_distances[id]
        building["green_normalizedDistance"] = all_distances[id] / max_distance
        buildings_with_distance[id] = building

    return buildings_with_distance


def __route_to_geojson(route: List[Tuple[float, float]]):
    points = [Point(pt[0], pt[1]) for pt in route]
    polygon = Polygon(points)

    return json.loads(to_geojson(polygon))


def __add_firestations_distance_and_path(buildings: Dict):
    buildings_with_firestations_data = {}

    counter = 0

    for id, building in buildings.items():
        building["firestation_distance"] = 0
        building["firestation_route"] = to_geojson(Polygon([]))
        building["firestation_travel_time"] = 0

        if counter > 10:
            buildings_with_firestations_data[id] = building
            continue

        polygon: Polygon = shape(building["geometry"])
        center: Point = polygon.centroid

        (
            distance,
            route,
            travel_time_traffic,
        ) = get_distance_from_fire_station(center.y, center.x)
        building["firestation_distance"] = distance.split(" ")[0]
        building["firestation_route"] = __route_to_geojson(route)

        building["firestation_travel_time"] = travel_time_traffic.split(" ")[0]

        buildings_with_firestations_data[id] = building

        counter += 1

    return buildings_with_firestations_data


def analyze_buildings(map_: Dict):
    buildings: Dict = {shape["id"]: shape for shape in map_["buildings"]}

    buildings_with_green_data = __add_building_to_green_distance(
        buildings, map_["green"]
    )

    buildings_with_firestations_data = __add_firestations_distance_and_path(
        buildings_with_green_data
    )

    return buildings_with_firestations_data
