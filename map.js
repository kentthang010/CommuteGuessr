var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	referrerPolicy: 'origin-when-cross-origin',
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var control = L.Routing.control({
	router: L.Routing.osrmv1({
		serviceUrl: 'https://router.project-osrm.org/route/v1',
		// driving, foot, bike
		profile: 'dance',
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