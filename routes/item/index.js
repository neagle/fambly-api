const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const List = mongoose.model('List');
const Item = mongoose.model('Item');
const auth = require('../../auth');
const _ = require('lodash');

router.get('/', function (req, res) {
	Item
		.find({})
		.sort({ index: 1 })
		.then(items => {
			res.status(200).json(items);
		});
});

router.post('/', function (req, res) {
	const newItem = new Item();

	newItem.name = req.body.name;
	newItem.list = req.body.list;
	newItem.createdBy = req.user;
	newItem.index = req.body.index;

	newItem
		.save()
		.then((item) => {
			res.status(200).json(item);
		})
		.error(err => {
			res.status(500).json(err);
		})
		.catch(err => {
			res.status(500).json(err);
			throw err;
		});
});

router.patch('/', function (req, res) {
	function updateItem (item) {
		return Item.update({
			_id: item._id
		}, {
			$set: _.pick(item, ['name', 'index', 'completed', 'deleted'])
		});
	}

	let items;
	if (req.body.items) {
		items = req.body.items;
	} else if (req.body.item) {
		items = [req.body.item];
	} else {
		res.status(500).json(err);
	}

	Promise.all(items.map(updateItem))
		.then((results) => {
			// console.log('results', results);
			// console.log('arguments', arguments);
			res.status(200).end();
		})
		.catch(err => {
			res.status(500).json(err);
		});
});

router.delete('/:id', function (req, res) {
	Item
		.findOne({ _id: req.params.id })
		.then(item => {
			if (item) {
				item.remove();
				res.status(200).json({
					success: true,
					deleted: item
				})
			} else {
				res.status(404).end();
			}
		});
});

module.exports = router;
