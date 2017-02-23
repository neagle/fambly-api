const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Promise = require('bluebird');

console.log('setting up setup');

router.get('/', function(req, res, next) {
	console.log('ROUTE ENGAGED');
	const users = [
		new User({
			email: 'n.eagle@gmail.com',
			password: 'xdmamqmd',
			admin: true
		}),
		new User({
			email: 'rebekaheagle@gmail.com',
			password: 'hmansion03',
			admin: false
		})
	];

	Promise
		.all(users.map(user => user.save()))
		.then(results => {
			console.log('Users set up successfully');
			res.status(200).json({ success: true });
		})
		.catch(err => {
			res.status(500).json(err);
		});
});

module.exports = router;
