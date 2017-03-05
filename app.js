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

	this.createMap = function(points){
		var base_tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        minZoom: 7,
        attribution: 'Map data (c) <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });
        var baseLayer = {
        "Base Layer": base_tile
        };
        var clusteredmarkers = L.markerClusterGroup();
        markers = [];
		for (var i = 0; i < points.length; i++) {
			if(parseFloat(points[i][0]) && parseFloat(points[i][1])){
				markers[i] = L.circle([parseFloat(points[i][0]),  parseFloat(points[i][1])], 25, {color: 'black',fillColor: '#66ff33',fillOpacity: 2.0});
				markers[i].bindPopup("<p>" + points[i][0] + ", " + points[i][1] + "</p>");
				markers[i]._popup.options.maxWidth = 300;
				clusteredmarkers.addLayer(markers[i]);
			}
		}
		var layer_list = {
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
	};
	this.applyFilters = function(){
		var rangeSlider = angular.element(document.getElementById('timeRange'));
		var values = rangeSlider.val().split(",");
		console.log(values)
		for (var i = 0; i < values.length; i++) {
			console.log(values[i]);
		}
		var csvString = "";
		$http.get("../out.csv").then(function(response){
			csvString = response.data;
		});
		var points = convertCSVtoJSON(csvString);
		this.createMap(points);
	};
	var Mapper = this;
	var csvString = "";
	$http.get("out.csv").then(function(response){
			csvString = response.data;
			var points = convertCSVtoJSON(csvString);
			console.log(points);
			Mapper.createMap(points);
	});
});