var http = require("http");
var express = require('express');
var app = express();

var jsonArr = [];

function printError(error) {
	console.error(error.message);
}

function get(url, route) {
	var request = http.get(url, function(response) {
		var body = "";

		response.on('data', function (chunk) {
			body += chunk;
		});

		response.on('end', function() {
			if (response.statusCode === 200) {
				try {
					printMessage(body, route);
				} catch (error) {
					printError(error);
				}
			} else {
				printError({message: "There was an error. (" + http.STATUS_CODES[response.statusCode] + ")"});
			}
		});
	});
	request.on('error', printError);
}

function printMessage(data, route) {
	console.log('Route: ' + route);
	var reg = /var point=new google.maps.LatLng\(26\.[\d]+,-80\.[\d]+\);/;
	var routeArr = [];

	var match = data.match(reg);

	if(match) {
		match.forEach(function(cord) {
			var point = cord.match(/26\.[\d]+,-80\.[\d]+/)[0];
			routeArr.push(point);
		});
	}

	jsonArr.push({
		route: route,
		points: routeArr
	});
}

function makeCall() {
	for(var i = 4; i <= 13; i++) {
		if(i != 11) {
			get("http://suntrolley.metromediaworks.net/mobile/route-map.php?height=546&route=" + i, i);
		}
	}

	var c = setInterval(function() {
		console.log(jsonArr);
		if(jsonArr.length > 0) clearInterval(c);
	}, 1000);
}

console.log("Hello Sun Trolley Water Trolley!");
makeCall();

app.get('/', function(req, res) {
	res.send(jsonArr);
});