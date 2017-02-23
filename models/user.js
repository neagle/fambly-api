const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	},
	name: String,
	password: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	}
});

UserSchema.pre('save', function (next) {
	const user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) {
		return next();
	} else {
		// generate a salt
		bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
			if (err) {
				return next(err);
			}

			// hash the password along with our new salt
			bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) {
					return next(err);
				}

				// override the cleartext password with the hashed one
				user.password = hash;
				next();
			});
		});
	}
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};


module.exports = mongoose.model('User', UserSchema);
