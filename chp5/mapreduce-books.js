'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Books');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

let bookSchema = mongoose.Schema({
	_id:Number,
	title:String,
	authors:[String],
	subjects:[String]	
});

let bookModel = mongoose.model('book', bookSchema);

let mapRedObj = {};
mapRedObj.map = function(){
	for(var idx = 0; idx < this.authors.length; idx++){
		var key = this.authors[idx];
		emit(key, 1);
	}
	
		this.subjects.forEach(function(subject){
			emit(subject, subject);
			subject.split(/\s+--\s+/).forEach(function(part){
				emit(part, subject);
			});
		});
}

mapRedObj.reduce = function(keys, values){ return values.length }
mapRedObj.out = { inline:1 };

bookModel.mapReduce(mapRedObj, function (err, res){
	/*console.log('map reduce took %d ms', stats.processtime)
	db.by_author.find.where('value').gt(1).exec(function (err, docs) {
		if(err){
			console.error(err);
		} else {
			console.log(docs);
		}
	});*/
	console.log(res);
});