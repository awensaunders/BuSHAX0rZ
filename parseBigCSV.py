import csv
import json

with open("evidata.csv", "r") as bigCSV:
    with open("file.json", "w") as outFile:
        reader = csv.DictReader(bigCSV)
        output = json.dumps(list(reader))
        outFile.write(output)
