var map; // Variable para el mapa
var markers = []; // Array para almacenar marcadores
var directionsService; // Servicio de direcciones
var directionsDisplay; // Objeto para mostrar las direcciones
var routeMarker; // Variable para el marcador de la ruta
var routeIndex = 0; // Índice actual de la ruta
var routeCoordinates = []; // Coordenadas de la ruta
var updateInterval; // Intervalo de actualización del marcador
// Variable para almacenar las calles visitadas
var visitedStreets = new Set();

// Variable para almacenar las intersecciones
var intersections = new Set();

// Variable para almacenar la calle de inicio de la ruta
var startingStreet = '';

// Variable para almacenar la calle anterior
var previousStreet = '';

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

  // Obtener la calle actual en la que se encuentra el marcador
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'location': routeCoordinates[routeIndex] }, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        var streetName = extractStreetName(results[0].formatted_address);
        
        // Si es la primera calle, almacenar como la calle de inicio
        if (startingStreet === '') {
          startingStreet = streetName;
          addStreetToTable(startingStreet);
          visitedStreets.add(startingStreet);
        }
        
        // Verificar si la calle actual es diferente de la calle anterior
        if (streetName !== previousStreet) {
          addStreetToTable(streetName);
        }

        // Verificar si hay intersecciones con calles anteriores
        if (routeIndex > 0) {
          var intersection = getIntersection(streetName, previousStreet);
          if (intersection && !intersections.has(intersection)) {
            addStreetToTable(intersection);
            intersections.add(intersection);
          }
        }

        // Almacenar la calle actual como la calle anterior
        previousStreet = streetName;
      } else {
        console.log('No se encontraron resultados');
      }
    } else {
      console.log('Geocoder falló debido a: ' + status);
    }
  });

  // Comprobar si se ha llegado al final de la ruta
  if (routeIndex === routeCoordinates.length - 1) {
    clearInterval(updateInterval); // Detener la actualización del marcador
    alert("Ruta completada."); // Mostrar mensaje de ruta completada
  }
}

// Función para extraer el nombre de la calle de una dirección
function extractStreetName(address) {
  var streetName = address.split(',')[0].trim();
  return streetName;
}

// Función para obtener la intersección entre dos calles
function getIntersection(street1, street2) {
  if (street1 !== street2) {
    return street1 + ' & ' + street2;
  }
  return null;
}

// Función para agregar una calle a la tabla
function addStreetToTable(streetName) {
  var tableBody = document.querySelector('#streetTable tbody');
  if (!visitedStreets.has(streetName)) {
    // Comprobar si la calle ya está en la tabla
    var streetsInTable = tableBody.querySelectorAll('td');
    var streetAlreadyAdded = false;
    streetsInTable.forEach(function(cell) {
      if (cell.textContent === streetName) {
        streetAlreadyAdded = true;
      }
    });

    // Si la calle no está en la tabla, agregarla
    if (!streetAlreadyAdded) {
      var newRow = tableBody.insertRow();
      var cell = newRow.insertCell();
      cell.textContent = streetName;
      visitedStreets.add(streetName);
    }
  }
}


//aquí se contabilan los valres que se le va dar a respuesta

document.getElementById('quizForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Obtener los puntajes seleccionados
  const yearScore = parseInt(document.querySelector('input[name="year"]:checked').value);
  const priceScore = parseInt(document.querySelector('input[name="price"]:checked').value);
  const sparePartsScore = parseInt(document.querySelector('input[name="spareParts"]:checked').value);
  const trafficScore = parseInt(document.querySelector('input[name="traffic"]:checked').value);
  const usageScore = parseInt(document.querySelector('input[name="usage"]:checked').value);
  const ageScore = parseInt(document.querySelector('input[name="age"]:checked').value);
  const genderScore = parseInt(document.querySelector('input[name="gender"]:checked').value);
  const drivingHistoryScore = parseInt(document.querySelector('input[name="drivingHistory"]:checked').value);
  const trafficTimeScore = parseInt(document.querySelector('input[name="trafficTime"]:checked').value);
  const outOfTownScore = parseInt(document.querySelector('input[name="outOfTown"]:checked').value);

  // Calcular el puntaje total sumando los puntajes de cada pregunta
  const totalScore = yearScore + priceScore + sparePartsScore + trafficScore + usageScore + ageScore +
      genderScore + drivingHistoryScore + trafficTimeScore + outOfTownScore;

  // Mostrar el resultado
  document.getElementById('result').innerText = 'Tu puntaje es: ${totalScore}';
});