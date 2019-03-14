var map;
var marker;
var latlng;
var geocoder;
var infoWindow;

function InitMap() {
  latlng = new google.maps.LatLng(22.416239, 114.210312); // default location
  map = new google.maps.Map(document.getElementById("map"), {
    center: latlng,
    zoom: 15
  });
  marker = new google.maps.Marker();
  geocoder = new google.maps.Geocoder(); //实例化地址解析
  infoWindow = new google.maps.InfoWindow();

  if (navigator.geolocation) {
    // have access to current location
    navigator.geolocation.getCurrentPosition(
      function(position) {
        latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(latlng);
        placeMarker(latlng);
        // infoWindow.setPosition(latlng);
        // infoWindow.setContent('Current Location');
        // infoWindow.open(map);
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  google.maps.event.addListener(map, "click", function(event) {
    placeMarker(event.latLng);
    search({
      location: event.latLng
    });
  });

  var infowindowContent = document.getElementById("infowindow-content");
  infoWindow.setContent(infowindowContent);

  var input = document.getElementById("pac-input");
  var autocomplete = new google.maps.places.Autocomplete(input);
  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo("bounds", map);
  autocomplete.setFields(["address_components", "geometry", "icon", "name"]);
  autocomplete.addListener("place_changed", function() {
    infoWindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }
    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17); // Why 17? Because it looks good.
    }
    placeMarker(place.geometry.location);

    var address = "";
    if (place.address_components) {
      address = [
        (place.address_components[0] &&
          place.address_components[0].short_name) ||
          "",
        (place.address_components[1] &&
          place.address_components[1].short_name) ||
          "",
        (place.address_components[2] &&
          place.address_components[2].short_name) ||
          ""
      ].join(" ");
    }

    infowindowContent.children["place-icon"].src = place.icon;
    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent = address;
    infowindow.open(map, marker);
  });
}

function placeMarker(pos) {
  // clear the previous marker and place a new one
  marker.setMap(null);
  marker = new google.maps.Marker({
    position: pos,
    map: map,
    draggable: true
  });
  google.maps.event.addListener(marker, "dragend", function(event) {
    search({
      location: event.latLng
    });
  });
}

function search(query, func) {
  if (geocoder) {
    geocoder.geocode(query, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          if (func != undefined) {
            func(results[0].geometry.location);
          }
          showMessage(results[0].formatted_address);
          $("#pac-input").val(results[0].formatted_address);
        } else {
          alert("Geocoder failed due to: " + status);
        }
      }
    });
  }
}

function showMessage(address) {
  infoWindow.setMap(null);
  infoWindow = new google.maps.InfoWindow({
    content: address,
    size: new google.maps.Size(50, 50)
  });
  infoWindow.open(map, marker);
  document.getElementById("resultAddr").value = address;
}

function clickSearchBtn() {
  var address = $("#pac-input").val();
  search(
    {
      address: address
    },
    placeMarker
  );
}
