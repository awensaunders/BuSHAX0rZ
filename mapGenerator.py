import heatMap
collisions = []
with open('../test/accidents.csv','r') as f:
        while True:
            line = f.readline()
            if not line: break
            collision = line.split(',')
            collisions.append(collision)
        print(collisions)
f.close()
for i in range(0,(len(collisions) - 1)):
	heatMap.addSpot(str(collisions[i][0]),str(collisions[i][1]),1, collisions[i][2])
heatMap.createMap("localhost","http://")