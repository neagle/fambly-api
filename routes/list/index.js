const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../../auth');
const List = mongoose.model('List');
const Item = mongoose.model('Item');
const Promise = require('bluebird');
const _ = require('lodash');

router.get('/', function (req, res) {
	List
		.find({})
		.sort({ index: -1 })
		.populate({
			path: 'items',
			match: {
				completed: false
			},
		})
		.then(lists => {
			res.status(200).json(lists);
		});
});

router.get('/:id', function (req, res) {
	List
		.findOne({ _id: req.params.id })
		.populate({
			path: 'items',
			match: {
				completed: false
			},
			populate: {
				path: 'createdBy',
			},
			options: {
				sort: {
					index: -1
				}
			}
		})
		.then(list => {
			if (!list) {
				res.status(404);
			} else {
				res.status(200).json(list);
			}
		})
		.catch(error => {
			res.status(500).json(error);
		});
});

router.delete('/:id', function (req, res) {
	List
		.findOne({ _id: req.params.id })
		.then(list => {
			if (!list) {
				res.status(404).end();
			} else {
				list.remove();
				res.status(200).json({
					success: true,
					deleted: list
				});
			}
		})
});

router.post('/', function (req, res) {
	const newList = new List();

	newList.name = req.body.name;
	newList.index = req.body.index;
	newList.createdBy = req.user;

	newList.save().then(list => {
		res.status(200).json(list);
	}).catch(err => {
		res.status(500).json(err);
	});
});

router.patch('/', function (req, res) {
	Promise.all(req.body.lists.map(list => List.update({
		_id: list._id
	}, {
		$set: _.pick(list, ['name', 'index'])
	})))
		.then(() => {
			res.status(200).end();
		})
		.catch(err => {
			res.status(500).json(err);
		});
});

module.exports = router;
