from jinja2 import Environment, FileSystemLoader

env = Environment(
    loader=FileSystemLoader('.'),
)

heatspots = "var heat = L.heatLayer(["
spotCounter = 0
clickSpots = ""
busStops = ""
stopCounter = 0
def createMap(ip,protocol):
    global heatspots
    global busStops
    global clickSpots
    heatspots = heatspots + "], {radius: 25}, {0.2: 'blue', 0.4: 'lime', 0.6: 'red'})"
    template = env.get_template("template.jinja2")
    file = open('osm.html', 'w')
    file.write(template.render(heatspots=heatspots, clickSpots=clickSpots, busStops=busStops))
    file.close()
def addStop(lat,lng,name):
    global stopCounter
    global busStops
    busStops += "var circle_" + str(stopCounter) + "= L.circle([" + lat + ",  " + lng + "], 25, {color: 'blue',fillColor: '#4286f4',fillOpacity: 2.0});\ncircle_" + str(stopCounter) + ".bindPopup(\"<p>" + str(name).strip() + "</p>\");\ncircle_" + str(stopCounter) + "._popup.options.maxWidth = 300;\nstops.addLayer(circle_" + str(stopCounter) + ");"
    stopCounter += 1
def addSpot(lat,lng,intensity, date):
    print(lat)
    print(lng)
    print(intensity)
    global heatspots
    global clickSpots
    global spotCounter
    heatspots += "[" + lat + "," + lng + "," + str(intensity) + "],"
    clickSpots += "var circle_" + str(spotCounter) + "= L.circle([" + lat + ",  " + lng + "], 25, {color: 'black',fillColor: '#66ff33',fillOpacity: 2.0});\ncircle_" + str(spotCounter) + ".bindPopup(\"<p>" + str(date).strip() + "</p>" + "<p>" + str(lat) + "," + str(lng) + "</p>\");\ncircle_" + str(spotCounter) + "._popup.options.maxWidth = 300;\nclusteredmarkers.addLayer(circle_" + str(spotCounter) + ");"
    spotCounter += 1
def clear():
    global heatspots
    heatspots = "var heat = L.heatLayer(["
