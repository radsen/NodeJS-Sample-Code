#! /usr/bin/env node --harmony
'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + process.argv[2]);
const db = mongoose.connection;

const system = require('sys');
const input = process.openStdin();

db.on('error', console.error.bind(console, 'connection error:'));

let bookSchema = mongoose.Schema({
	_id:Number,
	title:String,
	authors:[String],
	subjects:[String]	
});
let bookModel = '';

db.once('open', function(){
	console.log('Opening "Books" database for querying...');
	bookModel = mongoose.model('book', bookSchema);
	console.log("Type a command or help and press enter to see the list of commands available.");
});	

input.addListener('data', function(data){
	let content = data.toString();
	content = content.substring(0, content.length - 1);
	
	let command = content.split(" ");
	let criteria = '{}';
	
	if(command[0] === 'find'){
		if(evalJSONQuery(command[1])){ criteria = JSON.parse(command[1]); }
		bookModel.find(criteria, function(err, books){
			console.log(books);
			console.log("Type a command:");
		});
	} else if (command[0] === 'delete') {
		if(evalJSONQuery(command[1])){ criteria = JSON.parse(command[1]); }
		bookModel.remove(criteria, function(err){
			if(err){
				console.error(err);
			} else {
				console.log("Book ID: " + criteria + " has been deleted");
			}
			console.log("Type a command:");
		});
	} else if (command[0] === 'help') {
		console.log("find - Gets the data based on the criteria used to query the schema ({\"_id\":9999})");
		console.log("Help - Shows all the commands available");
		console.log("remove - Deletes data based on the criteria or deletes everything on the DB schema if is empty.");
		console.log("exit - Closes the application");
		console.log("Type a command:");
	} else if (command[0] === 'exit') {
		process.exit(0);
	} else {
		console.log("The commmad typed does not exist, try again... :)");
		console.log("Type a command:");
	}
	
	
});

function evalJSONQuery(criteria){
	let valid = false;
	
	try {
		JSON.parse(criteria);
		valid = true;
	} catch(err) {
		
	}
	
	return valid;
}