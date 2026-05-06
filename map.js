// Initialize map
var map = L.map('map');
map.setView([getRandomLatitude(), getRandomLongitude()], 13);

// Sets the tile layer for the map using OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	referrerPolicy: 'origin-when-cross-origin',
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Sets up the routing control using Leaflet Routing Machine and OSRM
var control = L.Routing.control({
	containerClassName: 'routing-container',
	router: L.Routing.osrmv1({
		serviceUrl: 'https://routing.openstreetmap.de/' + getRandomTransportMode() + '/route/v1',
	}),
	routeWhileDragging: true
}).addTo(map);

var routeTimeInMinutes;

// Capture the travel time
control.on('routesfound', function (e) {
	var routes = e.routes;
	var summary = routes[0].summary;
	// Trying to solve the ocena problem but this is not
	// exhaustive.
	if (summary.totalTime === 0) {
		console.log('No route found, trying again...');
		randomizeLocation();
	}
	routeTimeInMinutes = Math.round(summary.totalTime / 60);
	console.log('Travel time: ' + routeTimeInMinutes + ' minutes');
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
}

// This function will be called when the user submits their guess for the travel time.
// It will compare the user's guess with the actual travel time and provide feedback.
const maxPoints = 5000;
var form = document.getElementById('guessForm');
form.addEventListener('submit', (event) => {
	event.preventDefault();

	var userGuess = parseInt(document.getElementById('guessH').value) * 60 + parseInt(document.getElementById('guessM').value);
	// 5000 is max points for a guess
	var score = maxPoints * (1 - Math.abs(userGuess - routeTimeInMinutes) / routeTimeInMinutes);
	score = Math.floor(Math.max(0, score));

	var guessDistance = Math.abs(routeTimeInMinutes - userGuess);
	if (guessDistance >= 60) {
		var formattedGuessDistance = "You were " + Math.floor(guessDistance / 60) + " hours and " + guessDistance % 60 + " minutes away!";
		displayScore(score, formattedGuessDistance);
	}
	else {
		var formattedGuessDistance = "You were " + guessDistance + " minutes away!";
		displayScore(score, formattedGuessDistance);
	}
})

function displayScore(score, guessDistance) {
	// Display the score
	console.log(score);
	document.getElementsByClassName('routing-container')[0].style.display = "block";
	document.getElementById('scoreDisplay').style.display = "flex";
	document.getElementById('scoreText').innerText = "You scored " + score + " points!";
	document.getElementById('guessDistanceText').innerText = guessDistance;

	// Hide the form
	document.getElementById('guessForm').style.display = "none";

}

// TODO
function nextRound() {
	score = 0;
	routeTimeInMinutes = 0;
	randomizeLocation();
}

// routed-bike, routed-foot and routed-car services
function getRandomTransportMode() {
	var transportModes = ['routed-car', 'routed-foot', 'routed-bike'];
	modeoftransport = transportModes[Math.floor(Math.random() * transportModes.length)];
	return modeoftransport;
}

function getRandomLatitude() {
	return 51.5 + (Math.random() * 2); // Random latitude around 51.5
}

function getRandomLongitude() {
	return -0.09 + (Math.random() * 2); // Random longitude around -0.09
}