const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const List = require('./list');
const _ = require('lodash');

const ItemSchema = new Schema({
	list: {
		type: Schema.Types.ObjectId,
		ref: 'List',
		required: true
	},
	quantity: Number,
	name: {
		type: String,
		required: true
	},
	index: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	completedAt: Date,
	completedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	deleted: {
		type: Boolean,
		default: false
	}
});

// Add a reference to the item's list
ItemSchema.pre('save', function (next) {
	List
		.findOne({ _id: this.list })
		.then(list => {
			list.items.push(this);
			list.save();
			next();
		});
});

ItemSchema.pre('update', function (next) {
	this.findOne().then(doc => {
		if (doc.completed) {
			// Remove the reference
			List
				.findOne({ _id: doc.list })
				.then(list => {
					_.remove(list.items, item => {
						return item.equals(doc._id)
					});
					list.save();
					next();
				});
		} else {
			next();
		}
	});
});

// Remove reference from the item's list
ItemSchema.pre('remove', function (next) {
	List
		.findOne({ _id: this.list })
		.then(list => {
			if (list) {
				const index = list.items.indexOf(this._id);
				list.items.splice(index, 1);
				list.save();
			}
			next();
		});
});

module.exports = mongoose.model('Item', ItemSchema);
