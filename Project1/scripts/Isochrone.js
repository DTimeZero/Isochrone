	var drivePolygons = [];
	
	var circlePoints = [];
	
	var drivePolyPoints = []

	var searchPolygon, drivePolygon = null;
	
	var travel_distance_km ;

	var travel_time_sec;
	
	var pointInterval = 5;
	
	var startpoint;
	
	var searchPointsmax;
	
	var directionsService = null;

	var markers = {};

	var selectedMode = google.maps.TravelMode.DRIVING;

	var directionsDisplay = new google.maps.DirectionsRenderer();

	var requestDelay = 100;

	var reset = function () {
	    circlePoints = [];

	    drivePolyPoints = [];

	    markers = {};

	    directionsDisplay.setMap(null);
	};

var drawIsochrones = function(posi,ds,distance,time,mode) {
	
	startpoint = posi;

	directionsService = ds;
	
	travel_distance_km = (distance * 1000) || 1000;

	travel_time_sec = (time * 60 ) || 60;
	
    selectedMode = mode || google.maps.TravelMode.DRIVING;
    
	centerMarker = placeMarker(startpoint, true);
	
	searchPoints = getCirclePoints(startpoint, distance);
	
	searchPointsmax = searchPoints.length;

	drivePolyPoints = [];

	directionsDisplay.setMap(window.map);directionsDisplay.setOptions( { suppressMarkers: true } );

	getDirections();

};

function getDirections() {
	if (!searchPoints.length) {
	    $('.progress-bar').css('width', '100%');
	    $('.progress-bar').text('100%');

		//Remove Search Circle
		searchPolygon.setMap(null);

		reset();

		//Process is finished.
		return;

	}

	else {

	    //Calculate Percetage done.
	    var percent = Math.round(100 - ((searchPoints.length / searchPointsmax) * 100));
	    $('.progress-bar').css('width', percent + '%');
	    $('.progress-bar').text(percent + '%'); 
	}

	var from = startpoint.lat() + ' ' + startpoint.lng();
	var to = searchPoints[0].lat() + ' ' + searchPoints[0].lng();
	
	//Removed processed Point. 
	searchPoints.shift()
	
	directionsDisplay.setMap(null);

	var request = {
		origin: from,
		destination: to,
		travelMode: google.maps.TravelMode[selectedMode],
		avoidHighways: false,
	};

	directionsService.route(request, directionsearch);
};

function directionsearch(response, status) {
	if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
		setTimeout(function() {
			getDirections(true)
		}, 4000)
	} else {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			var distance = parseInt(response.routes[0].legs[0].distance.value / 1609);
			var duration = parseFloat(response.routes[0].legs[0].duration.value / 3600).toFixed(2);
			console.log("duration:" + duration + " distance:" + distance);
			isochrone_Step(response.routes[0].legs[0].steps);
		} else {
			console.log(status);
			setTimeout(function() {
				getDirections(false)
			}, 100)
		}
	}
};

function isochrone_Step(steps) {
	
	var unit = 0;
	
	var temp_Points = [];
	
	var comparator = travel_time_sec;

	for (var n = 0; n < steps.length; n++) {
		
	    unit += steps[n].duration.value;
		
		if (unit < comparator) {
			temp_Points.push(steps[n].end_location)
		}
		 else {
			break;
		}
	}

    //This point becomes the Drivetime polygon marker.
	var lastPoint = temp_Points[temp_Points.length - 1];

	var hash = lastPoint.toString();
	
	if(!markers[hash])
	{
		markers[hash] = hash;
		console.log(hash);
		drivePolyPoints.push(lastPoint);
	
	if (drivePolyPoints.length == 1) {

		drivePolygon = new google.maps.Polygon({
			paths: drivePolyPoints,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 1,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			clickable: false,
			map: map
		});
		
		drivePolygon.setMap(map);
		
		drivePolygons.push(drivePolygon)
	}

	sortPoints2Polygon();
	
	drivePolygon.setPaths(drivePolyPoints);

	placeMarker(lastPoint, false);

	}

	setTimeout("getDirections()", requestDelay);
};

function sortPoints2Polygon() {
	
	points = [];
	
	var bounds = new google.maps.LatLngBounds();
	
	for (var i = 0; i < drivePolyPoints.length; i++) {
		
		points.push(drivePolyPoints[i]);
		
		bounds.extend(drivePolyPoints[i])
	}

	var center = bounds.getCenter();
	
	var bearing = [];
	
	for (var i = 0; i < points.length; i++) {
		
		points[i].bearing = google.maps.geometry.spherical.computeHeading(center, points[i]);
	}

	points.sort(sortByBearing);

	drivePolyPoints = points
}


function sortByBearing(a, b) {

    return (a.bearing - b.bearing)
};

function getCirclePoints(center, radius) {

	var circlePoints = [];
	var searchPoints = [];
	with(Math) {
		var rLat = (radius / 6378.135) * (180 / PI);
		var rLng = rLat / cos(center.lat() * (PI / 180));
		for (var a = 0; a < 361; a++) {
			var aRad = a * (PI / 180);
			var x = center.lng() + (rLng * cos(aRad));
			var y = center.lat() + (rLat * sin(aRad));
			var point = new google.maps.LatLng(parseFloat(y), parseFloat(x));
			circlePoints.push(point);
			if (a % pointInterval == 0) {
			    
				searchPoints.push(point)
			}
			
		}
	}
	
	searchPolygon = new google.maps.Polygon({
		paths: circlePoints,
		strokeColor: '#000000',
		strokeOpacity: 1,
		strokeWeight: 1,
		fillColor: '#ffffff',
		geodesic: true,
		fillOpacity: 0.5,
		clickable: false,
        visible: false
	});

	searchPolygon.setMap(map);
	
	return searchPoints
};

function placeMarker(location, isstartpoint) {
	
	var marker;

	var center = {
	    //url: 'center.png',
		//size: new google.maps.Size(32, 32),
		origin: new google.maps.Point(0,0)
		//anchor: new google.maps.Point(16, 32)
	};

	var point = {
	    //url: 'point.png',
		//size: new google.maps.Size(16, 16),
		origin: new google.maps.Point(0,0)
		//anchor: new google.maps.Point(8, 8)
	};

	if(isstartpoint)
	{
		marker = new google.maps.Marker({
			position: location,
			map: map,
            visible : false,
			//icon :center,
			//animation: google.maps.Animation.DROP
		});

	}
	else
	{
		marker = new google.maps.Marker({
			position: location,
			map: map,
            visible : false
			//icon :point
		});
	}

	return marker
}
