import requests
import datetime


API_KEY = ""
def __get_location_by_coordinates(lat, lng):
    return {'lat': lat, 'lng': lng}

def __get_nearest_fire_station(location, api_key):
    lat, lng = location['lat'], location['lng']
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=5000&type=fire_station&key={api_key}"
    response = requests.get(url)
    resp_json_payload = response.json()
    if resp_json_payload['status'] != 'OK':
        raise ValueError(f"Error finding nearest fire station: {resp_json_payload['status']}")
    return resp_json_payload['results'][0]['place_id']

def __get_distance(location, destination_id, api_key):
    lat, lng = location['lat'], location['lng']
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={lat},{lng}&destinations=place_id:{destination_id}&units=imperial&key={api_key}"
    response = requests.get(url)
    resp_json_payload = response.json()
    if resp_json_payload['status'] != 'OK':
        raise ValueError(f"Error finding distance: {resp_json_payload['status']}")
    return resp_json_payload['rows'][0]['elements'][0]['distance']['text']

def __get_route_and_travel_time(origin, destination_id, api_key):
    lat, lng = origin['lat'], origin['lng']
    now = datetime.datetime.now()
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={lat},{lng}&destination=place_id:{destination_id}&departure_time=now&key={api_key}"
    response = requests.get(url)
    resp_json_payload = response.json()
    if resp_json_payload['status'] != 'OK':
        raise ValueError(f"Error finding route: {resp_json_payload['status']}")
    
    # Extract polyline data for the route
    polyline = resp_json_payload['routes'][0]['overview_polyline']['points']
    
    # Extract travel time considering current traffic
    travel_time_traffic = resp_json_payload['routes'][0]['legs'][0]['duration_in_traffic']['text']
    
    return decode_polyline(polyline), travel_time_traffic

def decode_polyline(polyline_str):
    index, lat, lng = 0, 0, 0
    coordinates = []
    changes = {'latitude': 0, 'longitude': 0}

    # Coordinates have variable length when encoded, so just keep
    # track of whether we've hit the end of the string. In each
    # while loop iteration, a single coordinate is decoded.
    while index < len(polyline_str):
        # Gather lat/lon changes, store them in a dictionary to apply them later
        for unit in ['latitude', 'longitude']: 
            shift, result = 0, 0

            while True:
                byte = ord(polyline_str[index]) - 63
                index += 1
                result |= (byte & 0x1f) << shift
                shift += 5
                if not byte >= 0x20:
                    break

            if result & 1:
                changes[unit] = ~(result >> 1)
            else:
                changes[unit] = result >> 1

        lat += changes['latitude']
        lng += changes['longitude']

        coordinates.append((lat / 100000.0, lng / 100000.0))

    return coordinates
def __main():
    coordinates = {'lat': 37.4219999, 'lng': -122.0840575} 
    api_key = API_KEY
    location = __get_location_by_coordinates(coordinates['lat'], coordinates['lng'])
    nearest_fire_station_id = __get_nearest_fire_station(location, api_key)
    distance = __get_distance(location, nearest_fire_station_id, api_key)
    route, travel_time_traffic = __get_route_and_travel_time(location, nearest_fire_station_id, api_key)
    print(f"The distance to the nearest fire station is {distance}")
    print(f"The distance to the nearest fire station is {distance}")
    print(f"Travel time considering current traffic: {travel_time_traffic}")
    print(f"Route: {route}")  # This prints the encoded polyline of the route




def get_distance_from_fire_station(lat, lng):
    coordinates = {'lat': lat, 'lng': lng} 
    api_key = API_KEY
    location = __get_location_by_coordinates(coordinates['lat'], coordinates['lng'])
    nearest_fire_station_id = __get_nearest_fire_station(location, api_key)
    distance = __get_distance(location, nearest_fire_station_id, api_key)
    route, travel_time_traffic = __get_route_and_travel_time(location, nearest_fire_station_id, api_key)
    return distance, route, travel_time_traffic


if __name__ == "__main__":
    __main()