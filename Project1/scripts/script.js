var geocoder;
var map;
var myCenter = new google.maps.LatLng(51.508742, -0.120850);
var marker = new google.maps.Marker();
var directionsService = new google.maps.DirectionsService();
var options = {
    types: ['geocode'],
};
var input = document.getElementById('address');


$(document).ready(function () {
    $('#search').on('click', FindAddress);
    $('#generate').on('click', startPlotting);
})

    function initialize() {
        geocoder = new google.maps.Geocoder();
        var mapProp = {
            center: myCenter,
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map_canvas"), mapProp);

        //place the marker on the nearest street
        map.addListener('click', function (event) {
            var request = {
                origin: event.latLng,
                destination: event.latLng,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };

            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    marker.setPosition(response.routes[0].legs[0].start_location);
                    marker.setMap(map);
                }
            });
        });

    }


    function FindAddress() {

        var address = $("[name=address]").val();
        var minutes = $("[name=minutes]").val();

        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);

                var strposition = results[0].geometry.location + "";
                strposition = strposition.replace('(', '');
                strposition = strposition.replace(')', '');

                marker.setMap(map);
                marker.setPosition(results[0].geometry.location)
                map.setZoom(15);
            } else {
                alert('Address not found: ' + status);
            }
        });
    }

    autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
    });

    var startPlotting = function () {
        
        var tdur = $("[name=minutes]").val();
       
        var duration = Number(tdur);
        
        var selectedMode = $('input[name=transport]:checked').val();

        var travelMode = google.maps.TravelMode[selectedMode];

        var color = "FF0000";

        var distance=0;
        
            if (duration > -1) {
                var posi = marker.getPosition();
                switch (selectedMode) {
                    case "WALKING":
                        distance = duration * 5 / 60;
                        break;
                    case "DRIVING":
                        distance = duration *1.5;
                        break;
                    default:
                        distance = duration;
                }
                drawIsochrones(posi, directionsService, distance, duration, travelMode, color);
            }
            else
                alert("Choose a duration.")
        window.startPlotting = startPlotting;

    }


        google.maps.event.addDomListener(window, 'load', initialize);
