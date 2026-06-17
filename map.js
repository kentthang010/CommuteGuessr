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

var routeTimeInMinutes;

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
	routeTimeInMinutes = Math.round(summary.totalTime / 60);
	console.log('Travel time: ' + routeTimeInMinutes + ' minutes');
});

randomizeLocation();

// This function generates a random starting point around a central location (e.g., London)
// Later on I want it to not just be around London but also all over the world.
// Perhaps, a way to avoid generating points in the ocean is sufficient.
async function randomizeLocation() {
	// Coordinates for the first waypoint
	var lat1 = getRandomLatitude();
	var lon1 = getRandomLongitude();

	// Coordinates for the second waypoint
	var lat2 = getRandomLatitude();
	var lon2 = getRandomLongitude();

	Promise.all([
		fetchLocationName(lat1, lon1),
		fetchLocationName(lat2, lon2),
	]).then((values) => {
		console.log(values);
		if (values.includes("error")) {
			randomizeLocation();
			return;
		}
		document.getElementById('locationInfo').innerText = "How long is the commute between " + values[0] + " and " + values[1] + "?";
	});

	// Set waypoints and "camera" position
	var corner1 = L.latLng(lat1, lon1);
	var corner2 = L.latLng(lat2, lon2);
	map.fitBounds([corner1, corner2]);

	control.setWaypoints([
		corner1,
		corner2
	]);

	// Get the new route with the randomized transport mode
	control.getRouter().options.serviceUrl = 'https://routing.openstreetmap.de/' + getRandomTransportMode() + '/route/v1';
	control.route();
}

// Can be used to figure out if a waypoint is in the ocean or not.
async function fetchLocationName(lat, lon) {
	const response = await fetch(
		`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
	);
	const data = await response.json();
	console.log(data);

	if (Object.hasOwn(data, "error") || data.addresstype == "state") {
		console.log("Error");
		return "error";
	}
	else if (data.name != "")
		return data.name;
	else
		// Fall back to the first location of display name if no name exists for location
		return data.display_name.split(',')[0];
}

// This function will be called when the user submits their guess for the travel time.
// It will compare the user's guess with the actual travel time and provide feedback.
const maxPoints = 5000;
var totalScore = 0; // Maybe we want to put all these variables at start
var form = document.getElementById('guessForm');
form.addEventListener('submit', (event) => {
	event.preventDefault();

	var userGuessHours = parseInt(document.getElementById('guessH').value);
	var userGuessMinutes = parseInt(document.getElementById('guessM').value);
	var userGuessInTotalMinutes = userGuessHours * 60 + userGuessMinutes;
	// 5000 is max points for a guess
	var score = maxPoints * (1 - Math.abs(userGuessInTotalMinutes - routeTimeInMinutes) / routeTimeInMinutes);
	score = Math.floor(Math.max(0, score));
	totalScore += score;

	var guessDistance = Math.abs(routeTimeInMinutes - userGuessInTotalMinutes);
	var formattedGuessDistance = "Your guess of " + userGuessHours + " hours and " + userGuessMinutes + " minutes";
	if (guessDistance >= 60) {
		formattedGuessDistance = formattedGuessDistance + " were " + Math.floor(guessDistance / 60) + " hours and " + guessDistance % 60 + " minutes away!";
		displayScore(score, formattedGuessDistance);
	}
	else {
		formattedGuessDistance = formattedGuessDistance + " were " + guessDistance + " minutes away!";
		displayScore(score, formattedGuessDistance);
	}
})

function displayScore(score, guessDistanceText) {
	// Display the score
	document.getElementsByClassName('routing-container')[0].style.display = "block";
	document.getElementById('scoreDisplay').style.display = "flex";
	document.getElementById('totalScoreDisplay').innerText = "Total score: " + totalScore;
	document.getElementById('scoreText').innerText = "You scored " + score + " points!";
	document.getElementById('locationInfo').innerText = guessDistanceText;

	// Hide the form
	document.getElementById('guessForm').style.display = "none";
}

function hideScoreAndShowForm() {
	document.getElementsByClassName('routing-container')[0].style.display = "none";
	document.getElementById('scoreDisplay').style.display = "none";
	document.getElementById('scoreText').innerText = "";
	document.getElementById('locationInfo').innerText = "";

	// Display the form
	document.getElementById('guessForm').style.display = "flex";

}

function nextRound() {
	score = 0;
	routeTimeInMinutes = 0;
	hideScoreAndShowForm();
	randomizeLocation();
}

// routed-bike, routed-foot and routed-car services
function getRandomTransportMode() {
	var transportModes = ['routed-car', 'routed-foot', 'routed-bike'];
	var transportModeEmojis = {
		'routed-car': " Driving 🚗",
		'routed-foot': " Walking 🚶",
		'routed-bike': " Biking 🚴‍♂️",
	};
	modeOfTransport = transportModes[Math.floor(Math.random() * transportModes.length)];
	document.getElementById("transportmodeimgid").innerText = "Mode of transport: " + transportModeEmojis[modeOfTransport];
	return modeOfTransport;
}

function getRandomLatitude() {
	return 51.5 + (Math.random() * 2); // Random latitude around 51.5
}

function getRandomLongitude() {
	return -0.09 + (Math.random() * 2); // Random longitude around -0.09
}