const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const path = require('path');
const fs = require('fs');
const auth = require('./auth');

const config = require('./config'); // get our config file

// Bootstrap models
const modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
	require(modelsPath + '/' + file);
});

// =======================
// configuration =========
// =======================
const port = process.env.PORT || 8181;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================

const allowCrossDomain = function (req, res, next) {
	console.log('allowCrossDomain');
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
	res.header('Access-Control-Allow-Headers', 'Access-Control-*, Content-Type, x-access-token');
	res.header('Access-Control-Expose-Headers', 'Access-Control-*, x-access-token');

	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	}
	else {
		next();
	}
};

app.use(allowCrossDomain);

// basic route
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});
app.use('/setup', require('./routes/setup'));
app.use('/api/authenticate', require('./routes/authenticate'));

// API ROUTES -------------------
app.all('/api/*', auth.ensureAuthenticated);
app.use('/api/list', require('./routes/list'));
app.use('/api/item', require('./routes/item'));

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
