'use strict'

const fs = require('fs');
const net = require('net');
var file = process.argv[2];

const server = net.createServer(function(connection){
	// Reporting
	console.log('Subscriber connected');
	connection.write("Now watching '" + file + "' for changes... \n");
	
	// Watcher setup
	let watcher = fs.watch(file, function(event, filename){
		var date = new Date();
		connection.write("File '" + file + "' changed: " + date + "\n");	
	});
	
	//cleanup
	connection.on('close', function(){
		console.log('Subscriber disconnected.');
		watcher.close();
	});
	
});

if(!file){
	throw Error('No target filename was specified.');
}

server.listen(5432, function(){
	console.log("Listening for subscribers...");
});