const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const auth = require('../auth');

router.post('/', function(req, res) {
	console.log('AUTHENTICATING', req.body.email);
	User.findOne({ email: req.body.email }, function(err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			user.comparePassword(user.password, (err, isMatch) => {
				if (isMatch) {
					res.json({ success: false, message: 'Authentication failed. Wrong password.' });
				} else {
					// if user is found and password is right
					// create a token
					var token = jwt.sign(user, req.app.get('superSecret'), {
						expiresIn: '365d'
					});

					// return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}
			});
		}
	});
});

module.exports = router;
