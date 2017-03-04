heatspots = "var heat = L.heatLayer(["
spotCounter = 0
clickSpots = ""
def createMap(ip,protocol):
    global heatspots
    heatspots = heatspots + "], {radius: 25}, {0.2: 'blue', 0.4: 'lime', 0.6: 'red'})"
    file = open('osm.html', 'w')
    file.write('''<!DOCTYPE html>
        <html ng-app="mapper" ng-controller="MapperController as Mapper">
        <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.js"></script>
        
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular-cookies.js"></script>
        <script src="app.js"></script>
        
        <link rel="stylesheet" href="https://rawgit.com/lvoogdt/Leaflet.awesome-markers/2.0/develop/dist/leaflet.awesome-markers.css">
        <script src="https://rawgithub.com/lvoogdt/Leaflet.awesome-markers/2.0/develop/dist/leaflet.awesome-markers.js"></script>
        
        
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/MarkerCluster.Default.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/MarkerCluster.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/leaflet.markercluster-src.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/leaflet.markercluster.js"></script>
        <script src="leaflet-heat.js"></script>
        <link rel="stylesheet" href="https://birdage.github.io/Leaflet.awesome-markers/dist/leaflet.awesome.rotate.css">
        
        
        
        
        
        
        <link rel="stylesheet" type="text/css" href="style.css">
        </head>
        
        <body>
        <div class="containerCard"><p class="standardFont">Should probably think of something to put in here :)</p></div>
        <div class="folium-map" id="folium_b18b2b2798f2418ba465ac3f4f8c0f67" style="width: 100%; height: 100%"></div>
        
        <script>
        var base_tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        minZoom: 7,
        attribution: 'Map data (c) <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });
                //cluster group
        var clusteredmarkers = L.markerClusterGroup();
        //section for adding clustered markers
        ''' + clickSpots + '''
        //add the clustered markers to the group anyway
        var baseLayer = {
        "Base Layer": base_tile
        };
        ''' + heatspots + '''
        var layer_list = {
            "Heat Map" : heat,
            "Individual accidents" : clusteredmarkers
        };
        
        /*
        Bounding box.
        */
        var southWest = L.latLng(-90, -180),
        northEast = L.latLng(90, 180),
        bounds = L.latLngBounds(southWest, northEast);
        
        /*
        Creates the map and adds the selected layers
        */
        var map = L.map('folium_b18b2b2798f2418ba465ac3f4f8c0f67', {
        center:[51, -1],
        zoom: 7,
        maxBounds: bounds,
        layers: [base_tile]
        });
        
        L.control.layers(baseLayer, layer_list).addTo(map);
        clusteredmarkers.addTo(map);
    </script>
    </body>
    </html>
    ''')
    file.close()
def addSpot(lat,lng,intensity, date):
    print(lat)
    print(lng)
    print(intensity)
    global heatspots
    global clickSpots
    global spotCounter
    heatspots += "[" + lat + "," + lng + "," + str(intensity) + "],"
    clickSpots += "var circle_" + str(spotCounter) + "= L.circle([" + lat + ",  " + lng + "], 25, {color: 'black',fillColor: '#66ff33',fillOpacity: 2.0});\ncircle_" + str(spotCounter) + ".bindPopup(\"<p>" + str(date) + "</p>" + "<p>" + str(lat) + "," + str(lng) + "</p>\");\ncircle_" + str(spotCounter) + "._popup.options.maxWidth = 300;\nclusteredmarkers.addLayer(circle_" + str(spotCounter) + ");"
    spotCounter += 1
def clear():
    global heatspots
    heatspots = "var heat = L.heatLayer(["