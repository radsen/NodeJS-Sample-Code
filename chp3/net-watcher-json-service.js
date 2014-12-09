'use strict'

const fs = require('fs');
const net = require('net');
var file = process.argv[2];

const server = net.createServer(function(connection){
	// Reporting
	console.log('Subscriber connected');
	connection.write(JSON.stringify({type:'watching', file:file}) + '\n');
	
	// Watcher setup
	let watcher = fs.watch(file, function(event, filename){
		var date = new Date();
		connection.write(JSON.stringify({
		type:'changed', 
		file:file,
		timestamp:Date.now()}
		) + '\n');
			
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