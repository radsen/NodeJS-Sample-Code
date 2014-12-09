'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		oauthID:String,
		name:String,
		created:Date
	}
);

module.exports = mongoose.model('User', UserSchema);