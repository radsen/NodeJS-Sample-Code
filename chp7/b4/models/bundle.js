'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const autoIncrement = require('mongoose-auto-increment');

let connection = mongoose.createConnection('mongodb://localhost/b4/');
autoIncrement.initialize(connection);

const BundleSchema = new Schema(
	{
		_userId:Number,
		type:String,
		name:String,
		books:{}	
	}
);

BundleSchema.plugin(autoIncrement.plugin, 'Bundle');
module.exports = mongoose.model('Bundle', BundleSchema);