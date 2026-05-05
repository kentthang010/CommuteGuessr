// Initialize map
var map = L.map('map');
map.setView([getRandomLatitude(), getRandomLongitude()], 13);
// Sets the tile layer for the map using OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	referrerPolicy: 'strict-origin-when-cross-origin',
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Sets up the routing control using Leaflet Routing Machine and OSRM
var control = L.Routing.control({
	containerClassName: 'routing-container',
	router: L.Routing.osrmv1(),
	routeWhileDragging: true
}).addTo(map);

// Capture the travel time
control.on('routesfound', function (e) {
	var routes = e.routes;
	var summary = routes[0].summary;
	// Trying to solve the ocean problem but this is not
	// exhaustive.
	if (summary.totalTime === 0) {
		console.log('No route found, trying again...');
		randomizeLocation();
	}
	var timeInMinutes = Math.round(summary.totalTime / 60);
	console.log('Travel time: ' + timeInMinutes + ' minutes');
});

randomizeLocation();

// This function generates a random starting point around a central location (e.g., London)
// Later on I want it to not just be around London but also all over the world.
// Perhaps, a way to avoid generating points in the ocean is sufficient.
function randomizeLocation() {
	map.setView([getRandomLatitude(), getRandomLongitude()], 13);

	control.setWaypoints([
		L.latLng(getRandomLatitude() + (Math.random() * 0.1), getRandomLongitude() + (Math.random() * 0.1)),
		L.latLng(getRandomLatitude() + (Math.random() * 0.1), getRandomLongitude() + (Math.random() * 0.1))
	]);

	control.getRouter().options.serviceUrl = 'https://routing.openstreetmap.de/' + getRandomTransportMode() + '/route/v1';

	control.route();
}

function getRandomTransportMode() {
	var transportModes = ['routed-car', 'routed-foot', 'routed-bike'];
	var transportModeEmojis = {
		'routed-car': " Driving 🚗",
		'routed-foot': " Walking 🚶",
		'routed-bike': " Biking 🚴‍♂️",
	};
	modeOfTransport = transportModes[Math.floor(Math.random() * transportModes.length)];
	console.log(transportModeEmojis[modeOfTransport]);
	document.getElementById("transportmodeimgid").innerText = transportModeEmojis[modeOfTransport];
	return modeOfTransport;
}

function getRandomLatitude() {
	return 51.5 + (Math.random() * 2); // Random latitude around 51.5
}

function getRandomLongitude() {
	return -0.09 + (Math.random() * 2); // Random longitude around -0.09
}