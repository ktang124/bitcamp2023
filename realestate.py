import requests
import json
import csv

# designate query type
url = "https://us-real-estate.p.rapidapi.com/v2/for-rent-by-zipcode"

headers = {
    "X-RapidAPI-Key": "09bca80104msh15e694ff58ae934p1dbb1djsnc6a79bbc62eb",
    "X-RapidAPI-Host": "us-real-estate.p.rapidapi.com"
}


def allCompanies():
    filename = "companyOffices.csv"
    data = open(filename, 'r')
    comps = []
    for line in csv.reader(data):
        comp, city, state, longitude, latitude, address = line
        if comp not in comps:
            comps.append(comp)

    return comps


def companyAddress(company: str, location: str):
    # csv, Adobe,San Jose,CA,37.331761,-121.893546,"345 Park Ave, San Jose, CA 95110"
    #line: ['Uber', 'New York City', 'NY', '40.7111415', '-74.0092626', '1400 Broadway Suite 1801, New York, NY 10018']
    filename = "companyOffices.csv"
    data = open(filename, 'r')
    for line in csv.reader(data):
        comp, city, state, longitude, latitude, address = line
        #zip = int(address[len(address)-5:len(address)])
        if comp == company and city == location:
            return address

    return ''


def companyCities(company: str):
    filename = "companyOffices.csv"
    data = open(filename, 'r')
    res = []
    for line in csv.reader(data):
        comp, city, state, longitude, latitude, address = line
        if comp == company:
            res.append(city)
    return res


def queryCompanyHousing(company: str, location: str, limit, price_min, price_max):
    filename = "companyOffices.csv"
    data = open(filename, 'r')
    for line in csv.reader(data):
        comp, city, state, longitude, latitude, address = line
        zip = int(address[len(address)-5:len(address)])
        if comp == company and city == location:
            return query(zip, limit, price_min, price_max)

    return ''


def query(zip, limit=10, price_min=0, price_max=99999, beds_min=0, beds_max=99, baths_min=0, baths_max=99):
    querystring = {"zipcode": zip, "limit": limit, "offset": "0",
                   "sort": "lowest_price", "price_min": price_min,
                   "price_max": price_max, "property_type": "apartment,condo,condop", "beds_min": beds_min,
                   "beds_max": beds_max, "baths_min": baths_min, "baths_max": baths_max}
    response = requests.request(
        "GET", url, headers=headers, params=querystring)
    json_data = json.loads(response.text)
    apts = ((json_data['data'])['home_search'])['results']
    return apts


def get_address(apt):
    address = (apt['location'])['address']
    str = address['line'] + ', ' + address['city'] + ', ' + \
        address['state_code'] + ', ' + address['postal_code']
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
    categories = ['beds', 'beds_min', 'beds_max']
    beds = max((apt['description'][beds]) if apt['description']
               [beds] else 0 for beds in categories)
    return beds


def get_baths(apt):
    categories = ['baths', 'baths_full', 'baths_max', 'baths_min',
                  'baths_full_calc', 'baths_partial_calc', 'baths_1qtr']
    baths = max(apt['description'][baths] if apt['description']
                [baths] else 0 for baths in categories)
    return baths


def get_price(apt):
    if apt['list_price']:
        price = apt['list_price']
    elif apt['list_price_min']:
        price = apt['list_price_min']
    elif apt['list_price_max']:
        price = apt['list_price_max']
    else:
        price = None
    return price

# res = query(zip=94024, limit=10, price_max=2000)

# f = open('sample.json')
# json_data = json.load(f)
# res = ((json_data['data'])['home_search'])['results']

# for apt in res:
#     print("Address: " + get_address(apt) + "\nBeds: " + str(get_beds(apt)) + "\nBaths: "
#           + str(get_baths(apt)) + "\nPrice: " + str(get_price(apt)) + "\n\n")
