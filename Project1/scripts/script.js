var geocoder;
var map;
var myCenter = new google.maps.LatLng(51.508742, -0.120850);
var clickMarker = new google.maps.Marker();

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapProp = {
        center: myCenter,
        zoom: 5,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map"), mapProp);
    map.addListener('click', function (e) {
        placeMarkerAndPanTo(e.latLng, map);
    });
}

function FindAddress() {
    // Récupération de l'adresse tapée dans le formulaire
    var adresse = document.getElementById('adresse').value;
    geocoder.geocode({ 'address': adresse }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            // Récupération des coordonnées GPS du lieu tapé dans le formulaire
            var strposition = results[0].geometry.location + "";
            strposition = strposition.replace('(', '');
            strposition = strposition.replace(')', '');
            // Affichage des coordonnées dans le <span>
            //document.getElementById('text_latlng').innerHTML = 'Coordonnées : ' + strposition;
            // Création du marqueur du lieu (épingle)
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
            });
            map.setZoom(15);
        } else {
            alert('Adresse introuvable: ' + status);
        }
    });
}

function placeMarkerAndPanTo(latLng, map) {
    clickMarker = new google.maps.Marker({
        position: latLng,
        map: map
    });
    map.panTo(latLng);
}

google.maps.event.addDomListener(window, 'load', initialize);