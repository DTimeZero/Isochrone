	var drivePolygons = [];
	
	var drivePolyPoints = [];

	var oldPoint;

	var searchPolygon, drivePolygon = null;

	var travel_time_sec;
	
	var pointInterval = 10;
	
	var startpoint;
	
	var searchPointsmax;
	
	var directionsService = null;

	var markers = {};

	var selectedMode = google.maps.TravelMode.DRIVING;

	var directionsDisplay = new google.maps.DirectionsRenderer();

	var color = $("#colorPicker").val();

	var requestDelay = 100;

	var starterPointInPoly;

	var reset = function () {

	    drivePolyPoints = [];

	    markers = {};

	    directionsDisplay.setMap(null);
	};	

	var changeColor = function () {
	    color = document.getElementById("colorPicker").value;
	    console.log(color);
	}

	var drawIsochrones = function (posi, ds, distance, time, mode) {

	starterPointInPoly = false;

	startpoint = posi;

	directionsService = ds;

	travel_time_sec = (time * 60 ) || 60;
	
    selectedMode = mode || google.maps.TravelMode.DRIVING;
    
	centerMarker = placeMarker(startpoint, true);
	
	searchPoints = getCirclePoints(startpoint,distance);
	
	searchPointsmax = searchPoints.length;

	drivePolyPoints = [];
	
	directionsDisplay.setMap(window.map);directionsDisplay.setOptions( { suppressMarkers: true } );

	getDirections();

};

function getDirections() {
    if (!searchPoints.length) {
        if (!starterPointInPoly) {
            drivePolyPoints.push(startpoint);
            sortPoints2Polygon();
            drivePolygon.setPaths(drivePolyPoints);
        }

	    $('.progress-bar').css('width', '100%');
	    $('.progress-bar').text('100%');

	    $('.progress-bar').text('Generation complete!');
	    $('.progress-bar').css('background-color', '#5cb85c');

		reset();

		//Process is finished.
		return;
	}

	else {

	    //Calculate Percetage done.
	    $('.progress-bar').css('background-color', '#5bc0de');
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
	        temp_Points.push(steps[n].end_location);
		}
		 else {
			break;
		}
	}

    //This point becomes the Drivetime polygon marker.
	console.log(temp_Points);
	if (temp_Points.length > 0) {
	    var lastPoint = temp_Points[temp_Points.length - 1];
	}
	else {
	    lastPoint = oldPoint;
	}
	console.log(lastPoint);
	var hash = lastPoint.toString();
	var hash = lastPoint.toString();
	if (!markers[hash]) {
	    markers[hash] = hash;
	        
	    drivePolyPoints.push(lastPoint);
	    if (drivePolyPoints.length >= 1) {

	        drivePolygon = new google.maps.Polygon({
	            paths: drivePolyPoints,
	            strokeColor: color,
	            strokeOpacity: 0.05,
	            strokeWeight: 1,
	            fillColor: color,
	            fillOpacity: 0.25,
	            clickable: false,
	            map: map
	        });

	        drivePolygon.setMap(map);

	        drivePolygons.push(drivePolygon)
	    }

	    sortPoints2Polygon();
	        
	    drivePolygon.setPaths(drivePolyPoints);

	    if (google.maps.geometry.poly.containsLocation(startpoint, drivePolygon)) {
	        starterPointInPoly = true;
	    }
	        
	    placeMarker(lastPoint, false);

	}
	oldPoint = lastPoint;
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

	var searchPoints = [];
	with(Math) {
		var rLat = (radius / 6378.135) * (180 / PI);
		var rLng = rLat / cos(center.lat() * (PI / 180));
		for (var a = 0; a < 361; a++) {
			var aRad = a * (PI / 180);
			var x = center.lng() + (rLng * cos(aRad));
			var y = center.lat() + (rLat * sin(aRad));
			
			if (a % pointInterval == 0) {
			    var point = new google.maps.LatLng(parseFloat(y), parseFloat(x));
			    searchPoints.push(point);  
			}
		}
	}
	return searchPoints
};

function placeMarker(location, isstartpoint) {
	
	var marker;

	if(isstartpoint)
	{
		marker = new google.maps.Marker({
			position: location,
			map: map,
            visible : false
		});
	}
	else
	{
		marker = new google.maps.Marker({
			position: location,
			map: map,
            visible : false
		});
	}
	return marker
}