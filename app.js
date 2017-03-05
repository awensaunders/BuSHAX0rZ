var app = angular.module('Mapper',['ngCookies']);
function convertCSVtoJSON(csv){
	var lines = csv.split(/\r\n|\n/);
	var data = []
	for (var i = 0; i < lines.length; i++) {
		data.push(lines[i].split(","));
	}
	return data;
}
app.controller('MapperController',function($q,$sce,$compile,$scope,$http,$cookies){
	//chuck all the requests in here, probably put them in some functions

	this.createMap = function(collision_points, bus_stops){
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
				markers[i].bindPopup("<p>" + collision_points[i][0] + ", " + collision_points[i][1] + "</p>");
				markers[i]._popup.options.maxWidth = 300;
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
	};
	this.applyFilters = function(){
		var rangeSlider = angular.element(document.getElementById('timeRange'));
		var values = rangeSlider.val().split(",");

		var csvString = "";
		$http.get("out.csv").then(function(response){
		csvString = response.data;
		var points = convertCSVtoJSON(csvString);
		var busStops;
		$http.get("stops.json").then(function(response){
			busStops = response.data;
		});
		Mapper.createMap(points, busStops);
		});
	};
	var Mapper = this;
	var csvString = "";
	$http.get("out.csv").then(function(response){
		csvString = response.data;
		var points = convertCSVtoJSON(csvString);
		var busStops;
		$http.get("stops.json").then(function(response){
			busStops = response.data;
			Mapper.createMap(points, busStops);
		});
	});
});