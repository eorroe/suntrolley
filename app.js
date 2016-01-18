var http = require("http");
var cors = require('cors');
var express = require('express');
var app = express();

function get(url, route) {
	var data = new Promise(function(resolve) {
		var request = http.get(url, function(response) {
			var body = '';

			response.on('data', function (chunk) {
				body += chunk;
			});

			response.on('end', function() {
				resolve(body);
			});
		});
	});

	return data;
}

var reg = /var[\s]*point[\s]*=[\s]*new google.maps.LatLng\(26\.[\d]+,[\s]*-80\.[\d]+\)/gi;

function getPoints(body) {
	var data = new Promise(function(resolve) {
		var points = [];

		var match = body.match(reg);

		if(match) {
			match.forEach(function(cord) {
				var point = cord.match(/26\.[\d]+,[\s]*-80\.[\d]+/)[0];
				points.push(point);
			});
		}
		resolve(points);
	});

	return data;
}

function getTrolleys() {
	var arr = [];
	for(var route = 4; route <= 13; route++) {
		if(route != 11) {
			arr.push({
				route: route,
				body: get("http://suntrolley.metromediaworks.net/mobile/route-map.php?height=546&route=" + route)
			});
		}
	}

	var data = arr.map(function(data) {
		return data.body.then(getPoints).then(function(points) {
			return {
				route: data.route,
				points: points
			};
		});
	});

	return Promise.all(data).then(function(data) {
		return data;
	});
}

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.redirect('/wiki');
});

app.get('/wiki', function(req, res) {
	res.redirect('https://github.com/eorroe/suntrolley/wiki');
});

app.get('/api', cors(), function(req, res) {
	getTrolleys().then(function(trolleys) {
		if(req.query.route) {
			trolleys = trolleys.filter(function(trolley) {
				if(trolley.route == req.query.route) return trolley;
			});
		}
		res.send(trolleys);
	});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log('SunTrolley Is Running On Port ' + port);
});
