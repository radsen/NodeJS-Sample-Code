'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema(
	{
		_id:Number,
		title:String,
		authors:[String],
		subjects:[String]	
	}
);

module.exports = mongoose.model('Book', BookSchema);