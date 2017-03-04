#! /bin/python3

import csv
import time
from geopy.geocoders.googlev3 import GoogleV3

geocoder = GoogleV3(api_key="AIzaSyAy6XiyZG-6u99q-qacOz-dtT9ILbYzb-4")
with open("../ReadingBusesOrig.csv") as cf:
    with open("../out.csv", "a") as cw:
        reader = csv.DictReader(cf)
        writer = csv.DictWriter(cw, ["latitude", "longitude", "date"])
        startrow = 0
        for i in range(0, startrow):
            row = reader[i]
            location = geocoder.geocode(row['Place of Event'], components={
                "locality": "Reading",
                "country": "GB"
            })

            print("Resolved Address: " + str(location.address))
            print("Latitude: " + str(location.latitude))
            print("Longitude: " + str(location.longitude))
            print('\n')
            writer.writerow({
                "latitude": location.latitude, "longitude": location.longitude, "date": row['Accident Date']
            })
            time.sleep(0.2)
