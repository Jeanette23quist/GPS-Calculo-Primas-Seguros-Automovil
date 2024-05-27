var map; // Variable para el mapa
var markers = []; // Array para almacenar marcadores
var directionsService; // Servicio de direcciones
var directionsDisplay; // Objeto para mostrar las direcciones
var routeMarker; // Variable para el marcador de la ruta
var routeIndex = 0; // Índice actual de la ruta
var routeCoordinates = []; // Coordenadas de la ruta
var updateInterval; // Intervalo de actualización del marcador

function initMap() {
  // Configuración inicial del mapa
  var torreon = {lat: 25.5397, lng: -103.4460};
  map = new google.maps.Map(document.getElementById('map'), {
    center: torreon,
    zoom: 12
  });

  // Inicialización de los servicios de direcciones y de la visualización de direcciones
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);

  // Listener para añadir marcadores al hacer clic en el mapa
  map.addListener('click', function(event) {
    addMarker(event.latLng);
  });
}

// Función para añadir un marcador a la ubicación dada
function addMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);
}

// Función para trazar la ruta entre los marcadores
function traceRoute() {
  // Verifica si hay al menos dos marcadores
  if (markers.length < 2) {
    alert("Agrega al menos dos marcadores para trazar la ruta.");
    return;
  }
  
  // Configuración de los puntos intermedios de la ruta
  var waypoints = [];
  for (var i = 1; i < markers.length - 1; i++) {
    waypoints.push({
      location: markers[i].getPosition(),
      stopover: true
    });
  }

  // Configuración de la solicitud de ruta
  var request = {
    origin: markers[0].getPosition(),
    destination: markers[markers.length - 1].getPosition(),
    waypoints: waypoints,
    travelMode: 'DRIVING'
  };

  // Realización de la solicitud de ruta
  directionsService.route(request, function(response, status) {
    if (status === 'OK') {
      // Mostrar la ruta en el mapa
      directionsDisplay.setDirections(response);
      // Almacenar las coordenadas de la ruta
      routeCoordinates = response.routes[0].overview_path;
      // Añadir marcador de la ruta
      routeMarker = new google.maps.Marker({
        position: routeCoordinates[0],
        map: map
      });
      // Iniciar la actualización del marcador de la ruta
      startRouteMarkerUpdate();
      // Actualizar la posición del marcador de la ruta
      updateRouteMarkerPosition();
    } else {
      window.alert('Error al trazar la ruta: ' + status);
    }
  });
}

// Función para iniciar la actualización del marcador de la ruta
function startRouteMarkerUpdate() {
  updateInterval = setInterval(updateRouteMarkerPosition, 1000); // Actualizar cada segundo
}

// Función para actualizar la posición del marcador de la ruta
function updateRouteMarkerPosition() {
  routeIndex = (routeIndex + 1) % routeCoordinates.length;
  routeMarker.setPosition(routeCoordinates[routeIndex]);

  // Comprobar si se ha llegado al final de la ruta
  if (routeIndex === routeCoordinates.length - 1) {
    clearInterval(updateInterval); // Detener la actualización del marcador
    alert("Ruta completada."); // Mostrar mensaje de ruta completada
  }
}
