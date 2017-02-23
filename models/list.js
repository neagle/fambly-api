const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Item = require('./item');
const Promise = require('bluebird');

const ListSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	items: [{
		type: Schema.Types.ObjectId,
		ref: 'Item'
	}],
	deleted: {
		type: Boolean,
		default: false
	},
	index: {
		type: Number,
		default: 0
	}
});

// Delete any items in the list
ListSchema.pre('remove', function (next) {
	const items = [];
	this.items.forEach(id => {
		items.push(mongoose.model('Item')
			.findOne({ _id: id })
			.then(item => {
				if (item) {
					item.remove();
				}
			}));
	});

	Promise.all(items).then(next());
});

module.exports = mongoose.model('List', ListSchema);
