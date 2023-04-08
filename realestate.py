import requests
import json

url = "https://us-real-estate.p.rapidapi.com/v2/for-rent-by-zipcode"

headers = {
	"X-RapidAPI-Key": "09bca80104msh15e694ff58ae934p1dbb1djsnc6a79bbc62eb",
	"X-RapidAPI-Host": "us-real-estate.p.rapidapi.com"
}

def query(zip, limit, price_min, price_max):
    querystring = {"zipcode":zip,"limit":limit,"offset":"0",
                   "sort":"lowest_price","price_min":price_min,
                   "price_max":price_max,"property_type":"apartment"}
    response = requests.request("GET", url, headers=headers, params=querystring)
    json_data = json.loads(response.text)
    apts = ((json_data['data'])['home_search'])['results']
    return apts

def get_address(apt):
    address = (apt['location'])['address']
    str = address['line'] + ', ' + address['city'] + ', '+ address['state_code'] + ', ' + address['postal_code']
    return str

def get_coordinate(apt):
    coordinate = ((apt['location'])['address'])['coordinate']
    return coordinate

def get_href(apt):
    href = apt['href']
    return href

def get_image_href(apt):
    image_href = (apt['primary_photo'])['href']
    return image_href

def get_beds(apt):
    categories = ['beds','beds_min','beds_max']
    beds = max((apt['description'][beds]) if apt['description'][beds] else 0 for beds in categories)
    return beds

def get_baths(apt):
    categories =['baths','baths_full','baths_max','baths_min','baths_full_calc','baths_partial_calc','baths_1qtr']
    baths = max(apt['description'][baths] if apt['description'][baths] else 0 for baths in categories)
    return baths

def get_price(apt):
    categories =['list_price_max','list_price','list_price_min']
    price = max(apt[prices] if apt[prices] else 0 for prices in categories)
    return price

res = query(80301, 10, 0, 1000)

# f = open('sample.json')
# json_data = json.load(f)
# res = ((json_data['data'])['home_search'])['results']

for apt in res:
    print("Address: " + get_address(apt) + "\nBeds: " + str(get_beds(apt)) + "\nBaths: "
          + str(get_baths(apt)) + "\nPrice: " + str(get_price(apt)) + "\n\n")
