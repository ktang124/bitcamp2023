from flask import Flask, request, jsonify
from flask_cors import CORS

from realestate import *

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/")
def home():
    return "Internship Housing Finder"


@app.route("/companies")
def companies():
    return allCompanies()


@app.route("/offices")
def cities():
    company = request.args.get('company')
    if company is None:
        return []
    return companyCities(company)


@app.route("/coordinates")
def address():
    company = request.args.get('company')
    office = request.args.get('office')
    print(company, office)
    if not company or not office:
        return jsonify(False)
    print("company", company)
    print("office", office)
    return jsonify(companyCoordinates(company, office))

@app.route("/houses")
def houses():
    company = request.args.get('company')
    office = request.args.get('office')
    print(company, office)
    if not company or not office:
        return []
    print("company", company)
    print("office", office)

    return queryCompanyHousing(company, office, None, None, None)

@app.route("/search")
def search():
    zip_code = request.args.get('zip')
    data = query(zip=zip_code, limit=10, price_max=2000)
    print(data)
    return data


if __name__ == "__main__":
    app.run(port=8000, debug=True)
