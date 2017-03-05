var app = angular.module('Mapper',['ngCookies']);
function convertCSVtoJSON(csv){
	var lines = csv.split(/\r\n|\n/);
	var data = []
	for (var i = 0; i < lines.length; i++) {
		data.push(lines[i].split(","));
	}
	return data;
}
function filter(start_date, end_date,date, start_time, end_time, time){
	return ((start_date.getTime() <= date.getTime()) && (date.getTime() <= end_date.getTime()) && (start_time.isBefore(time)) && (time.isBefore(end_time)));
}
function toDateTime(current_date,secs) {
    var t = current_date; // Epoch
    t.setSeconds(secs);
    return t;
}
app.controller('MapperController',function($q,$sce,$compile,$scope,$http,$cookies){
	//chuck all the requests in here, probably put them in some functions
	this.createMap = function(collision_points, bus_stops){
		var weather_events = 0;
		var base_tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        minZoom: 7,
        attribution: 'Map data (c) <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });
        var baseLayer = {
        "Base Layer": base_tile
        };
        var clusteredmarkers = L.markerClusterGroup();
        var busStops = L.layerGroup();
        markers = [];
        heatPoints = [];
        bus_stop_markers = [];
		for (var i = 0; i < collision_points.length; i++) {
			var lat = parseFloat(collision_points[i][0]);
			var lng = parseFloat(collision_points[i][1]);
			if((lat) && (lng)){
				markers[i] = L.circle([lat,  lng], 25, {color: 'black',fillColor: '#66ff33',fillOpacity: 2.0});
				if(collision_points[i][3] == null){
					collision_points[i].push("No Data Found");
					collision_points[i].push("No Data Found");
				}
				else if((parseFloat(collision_points[i][28]) > 0.004) || (parseFloat(collision_points[i][29]) > 6)){
					weather_events += 1;
				}
				markers[i].bindPopup("<p>" + collision_points[i][0] + ", " + collision_points[i][1] + "</p><p> Date(M/D/Y) :" + collision_points[i][2] + "</p><p>Precipitation: " + collision_points[i][28] + "</p><p>Wind: " + collision_points[i][29] + "</p><p> Claim value: " + collision_points[i][26] + "</p><p>Incident Type: " + collision_points[i][18] + "</p>");
				clusteredmarkers.addLayer(markers[i]);
				heatPoints.push([lat,lng,1]);
			}
		}
		for (var i = 0; i < bus_stops.length; i++) {
			bus_stop_markers[i] = L.circle([bus_stops[i]["latitude"],bus_stops[i]["longitude"]],25,{color:'blue',fillColor:'#4286f4',fillOpacity:2.0});
			bus_stop_markers[i].bindPopup("<p>" + bus_stops[i]["description"] + "</p>");
			bus_stop_markers[i]._popup.options.maxWidth = 300;
			busStops.addLayer(bus_stop_markers[i]);
		}
		var heat = L.heatLayer(heatPoints, {radius: 25}, {0.2: 'blue', 0.4: 'lime', 0.6: 'red'});
		var layer_list = {
            "Individual accidents" : clusteredmarkers,
            "Bus Stops" : busStops,
            "Heat Map" : heat
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
        $scope.weather_events_p = weather_events.toString() + " bad weather events match to collisions";
	};
	this.getBusLocations = function(){
		var bus_locations = []
		$http.get("http://rtl2.ods-live.co.uk//api/vehiclePositions?key=8NhFg4aAy6").then(function(response){
				bus_locations = response.data;
		});
		return bus_locations;
	};
	this.applyFilters = function(){
		var csvString = "";
		//http://rtl2.ods-live.co.uk//api/vehiclePositions?key=8NhFg4aAy6
		var bus_locations = this.getBusLocations();
		this.reset();
	};
	this.reset = function(){
		$http.get("stops.json").then(function(response){
				busStops = response.data;
				var pointsToPass = []
				weather_data = response.data;
				this.combinedSet.forEach(function (item, key, mapObj) {
  					var pointArr = combinedSet.get(key);
  					pointsToPass.push(pointArr);
				});
				var mapContainer = angular.element(document.getElementById('folium_b18b2b2798f2418ba465ac3f4f8c0f67'));
				mapContainer.remove();
				var element = angular.element(document.getElementById('containerForLeaflet'));
				var foliumDiv = "<div class='folium-map' id='folium_b18b2b2798f2418ba465ac3f4f8c0f67'></div>";
				element.append($compile(foliumDiv)($scope));
				Mapper.createMap(pointsToPass, busStops);
			});
	};
    var Mapper = this;
    var csvString = "";
	$http.get("out.csv").then(function(response){
		csvString = response.data;
		var points = convertCSVtoJSON(csvString);
		this.combinedSet = new Map();
		var busStops;
		var weather_data;
		$http.get("stops.json").then(function(response){
			busStops = response.data;
			$http.get("WeatherData.json").then(function(response){
				weather_data = response.data;
				for (var i = 0; i < points.length; i++) {
					var dateToPass = new Date(points[i][2]);
					for (var x = 0; x < weather_data.length; x++) {
						if(dateToPass.getTime() == (new Date(weather_data[x]["timestamp"])).getTime()){
							points[i].push(weather_data[x]["precipitation"]);
							points[i].push(weather_data[x]["wind2"]);
							this.combinedSet.set(weather_data[x]["timestamp"],points[i]);
						}
					}
				}
				Mapper.createMap(points, busStops);
			});
		});
	});
});
