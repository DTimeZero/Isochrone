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
        /*var styledMap = new google.maps.StyledMapType(styles, {
            name: "Isochrone Map"
        });
        
        map.mapTypes.set('Isochrone Map', styledMap);
        map.setMapTypeId('Isochrone Map');*/
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
        
            if (duration > -1) {
                var posi = marker.getPosition();
                drawIsochrones(posi, directionsService, 3, duration, travelMode);
            }
            else
                alert("Choose a duration.")
        window.startPlotting = startPlotting;

    }


        google.maps.event.addDomListener(window, 'load', initialize);
    


/*function GenerateIsochrone() {
   /* geocoder = new google.maps.Geocoder();
    var address = $("[name=address]").val();
    var minutes = $("[name=minutes]").val();

    initialize();

    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);

            var strposition = results[0].geometry.location + "";
            strposition = strposition.replace('(', '');
            strposition = strposition.replace(')', '');

            console.log(strposition)
        };
    });


    console.log("Generate isochrone")

       /* $.ajax({
            url: 'https://legacy.route.cit.api.here.com/routing/6.2/calculateisoline.json',
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsoncallback',
            data: {
                mode: 'fastest;',
                start: '52.5160,13.3778',
                time: 'PT0H10M',
                app_id: '{YOUR_APP_ID}',
                app_code: '{YOUR_APP_CODE}'
            },
            success: function (data) {
                alert(JSON.stringify(data));
            }
        });

    
}*/