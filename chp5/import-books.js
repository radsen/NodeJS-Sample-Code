'use strict';

const async = require('async');
const file = require('file');
const rdfParser = require('./lib/rdf-parser.js');

// Importing mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + process.argv[2]);
// connect to db
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

let bookSchema = mongoose.Schema({
	_id:Number,
	title:String,
	authors:[String],
	subjects:[String]	
});
let Book = mongoose.model('book', bookSchema);

let errorCounter = 0;
let okCounter = 0;
let total = errorCounter + okCounter;

// Once the number of task was reduced to 10, all the files where imported
// to the DB. When it was 1000, the resources weren't exahusted to give us
// the error mentioned in the book. But we got errors processing the files
// and importing just like 9% of the entire amount.
let work = async.queue(function(path, done){
	rdfParser(path, function(err, doc){
		let book = new Book(doc); 
		
		book.save(function(err){
			if(err){
				console.log(path + " Error: " + err.message + " - WTF!");
				errorCounter++;
			}else{
				console.log("ID: " + book._id + " - Ok!");
				okCounter++;
			}
		});
		
		done();
	});	
}, 10);

work.drain = function(){
	console.log('Total files not imported: ' + errorCounter);
	console.log('Total files imported: ' + okCounter);
	console.log('Total files processed: ' + total);
}

console.log('beginning directory walk');
file.walk(__dirname + '/cache', function(err, dirPath, dirs, files){
	files.forEach(function(path){
		work.push(path);
	});
});