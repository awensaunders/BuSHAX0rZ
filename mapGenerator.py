import heatMap
import json
collisions = []
stops = []
with open('../out.csv','r') as f:
        while True:
            line = f.readline()
            if not line: break
            collision = line.split(',')
            collisions.append(collision)
f.close()
for i in range(0,(len(collisions) - 1)):
	heatMap.addSpot(str(collisions[i][0]),str(collisions[i][1]),1, collisions[i][2])
with open('stops.json','r') as stopJson:
	stops = json.load(stopJson)
f.close()
for i in range(0,(len(stops) - 1)):
	print("adding stop")
	heatMap.addStop(stops[i]["latitude"], stops[i]["longitude"], stops[i]["description"])
heatMap.createMap("localhost","http://")
