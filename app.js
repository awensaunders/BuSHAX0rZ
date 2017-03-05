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
	return ((start_date.getTime() <= date.getTime()) && (date.getTime() <= end_date.getTime()) && (start_time <= time) && (time <= end_time));
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
				else if((parseFloat(collision_points[i][3]) > 0.004) || (parseFloat(collision_points[i][4]) > 6)){
					weather_events += 1;
				}
				markers[i].bindPopup("<p>" + collision_points[i][0] + ", " + collision_points[i][1] + "</p><p> Date(M/D/Y) :" + collision_points[i][2] + "</p><p>Precipitation: " + collision_points[i][3] + "</p><p>Wind: " + collision_points[i][4] + "</p>");
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
		var rangeSlider = angular.element(document.getElementById('timeRange'));
		var values = rangeSlider.val().split(",");
		console.log(values[0]);
		console.log(values[1]);
		var startTime = 86400 / parseInt(100 - values[0]);
		var endTime = 86400 / parseInt(100 - values[1] + 1);
		var csvString = "";
		//http://rtl2.ods-live.co.uk//api/vehiclePositions?key=8NhFg4aAy6
		var bus_locations = this.getBusLocations();
		$http.get("out.csv").then(function(response){
			csvString = response.data;
			var points = convertCSVtoJSON(csvString);
			var busStops;
			$http.get("stops.json").then(function(response){
				busStops = response.data;
				$http.get("WeatherData.json").then(function(response){
					var pointsToPass = []
					weather_data = response.data;
					for (var i = 0; i < points.length; i++) {
						var currentDate = points[i][2].split("/");
						if(currentDate[1] < 12){
							var dateToPass = new Date(currentDate[2], currentDate[1],currentDate[0]);
						}else{
							if(currentDate[0] < 12){
								var dateToPass = new Date(parseInt(currentDate[2]), parseInt(currentDate[0]), parseInt(currentDate[1]));
							}
						}
						for (var x = 0; x < weather_data.length; x++) {
							if(dateToPass.getTime() == (new Date(weather_data[x]["timestamp"])).getTime()){
								points[i].push(weather_data[x]["precipitation"]);
								points[i].push(weather_data[x]["wind2"]);
							}
							if((startTime == 864) && (endTime == 86400)){
								startTime = (new Date(weather_data[x]["timestamp"])).getTime();
								endTime = (new Date(weather_data[x]["timestamp"])).getTime();

							}
							else{
								startTime = toDateTime(dateToPass,startTime);
								endTime = toDateTime(dateToPass,endTime);
							}
							if(filter($scope.startDate, $scope.endDate, dateToPass, startTime,endTime, (new Date(weather_data[x]["timestamp"])).getTime())){
								pointsToPass.push(points[i]);
							}
						}
					}
					var mapContainer = angular.element(document.getElementById('folium_b18b2b2798f2418ba465ac3f4f8c0f67'));
					mapContainer.remove();
					var element = angular.element(document.getElementById('containerForLeaflet'));
					var foliumDiv = "<div class='folium-map' id='folium_b18b2b2798f2418ba465ac3f4f8c0f67'></div>";
					element.append($compile(foliumDiv)($scope));
					Mapper.createMap(pointsToPass, busStops);
				});
			});
		});
	};
    var Mapper = this;
    var csvString = "";
	$http.get("out.csv").then(function(response){
		csvString = response.data;
		var points = convertCSVtoJSON(csvString);
		var busStops;
		var weather_data;
		$http.get("stops.json").then(function(response){
			busStops = response.data;
			$http.get("WeatherData.json").then(function(response){
				weather_data = response.data;
				for (var i = 0; i < points.length; i++) {
					var currentDate = points[i][2].split("/");
					if(currentDate[1] < 12){
						var dateToPass = new Date(parseInt(currentDate[2]), parseInt(currentDate[1]),parseInt(currentDate[0]));
					}else{
						if(currentDate[0] < 12){
							var dateToPass = new Date(parseInt(currentDate[2]), parseInt(currentDate[0]), parseInt(currentDate[1]));
						}
					}
					for (var x = 0; x < weather_data.length; x++) {
						if(dateToPass.getTime() == (new Date(weather_data[x]["timestamp"])).getTime()){
							points[i].push(weather_data[x]["precipitation"]);
							points[i].push(weather_data[x]["wind2"]);
						}
					}
				}
				Mapper.createMap(points, busStops);
			});
		});
	});
});
