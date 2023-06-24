from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: ApiKeyAuth
configuration = swagger_client.Configuration()
configuration.api_key['key'] = 'eec9c88b99914884b7e205633232406'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['key'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.APIsApi(swagger_client.ApiClient(configuration))
q = '47.54120811819261, -122.12652106822362' # str | Pass US Zipcode, UK Postcode, Canada Postalcode, IP address, Latitude/Longitude (decimal degree) or city name. Visit [request parameter section](https://www.weatherapi.com/docs/#intro-request) to learn more. 
#lang = 'lang_example' # str | Returns 'condition:text' field in API in the desired language.<br /> Visit [request parameter section](https://www.weatherapi.com/docs/#intro-request) to check 'lang-code'.  (optional)

try:
    # Realtime API
    api_response = api_instance.realtime_weather(q)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling APIsApi->realtime_weather: %s\n" % e)