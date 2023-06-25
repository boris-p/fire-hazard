import shapefile
import json


def shp_to_geojson(filename):
  sf = shapefile.Reader(filename)
  f = open(filename + ".geojson", "w")
  f.write(json.dumps(sf.__geo_interface__))



shp_to_geojson('files/hourly_isochrones')
# f = open("test.json", "w")
# f.write(json.dumps(sf.__geo_interface__))