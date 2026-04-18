var lat = 51.5 + (Math.random() - 0.5) * 0.1;
var lng = -0.09 + (Math.random() - 0.5) * 0.1;
var transportModes = ['routed-car', 'routed-foot', 'routed-bike'];
var modeoftransport = transportModes[Math.floor(Math.random() * transportModes.length)];

function randomizeStart() {
	// This function generates a random starting point around a central location (e.g., London)
	// Later on I want it to not just be around London but also all over the world.
	// Perhaps, a way to avoid generating points in the ocean is sufficient.
	lat = 51.5 + (Math.random() - 0.5) * 0.1; // Random latitude around 51.5
	lng = -0.09 + (Math.random() - 0.5) * 0.1; // Random longitude around -0.09
}

var map = L.map('map').setView([lat, lng], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	referrerPolicy: 'origin-when-cross-origin',
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var control = L.Routing.control({
	containerClassName: 'routing-container',
	router: L.Routing.osrmv1({
		// routed-bike, routed-foot and routed-car services do
		serviceUrl: 'https://routing.openstreetmap.de/' + modeoftransport + '/route/v1',
	}),
	waypoints: [
		L.latLng(51.5, -0.5),
		L.latLng(51.51, -0.12)
	],
	routeWhileDragging: true
}).addTo(map);

// Capture the travel time
control.on('routesfound', function (e) {
	var routes = e.routes;
	var summary = routes[0].summary;
	// summary.totalTime gives time in seconds
	var timeInMinutes = Math.round(summary.totalTime / 60);
	console.log('Travel time: ' + timeInMinutes + ' minutes');
});

// var marker = L.marker([51.5, -0.09]).addTo(map);