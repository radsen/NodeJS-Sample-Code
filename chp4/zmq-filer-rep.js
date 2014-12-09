"use strict";

const fs = require('fs');
const zmq = require('zmq');

// socket to reply to client
const responder = zmq.socket('rep');

const domain = require('domain');
const d = domain.create();

// handle incoming requests
responder.on('message', function(data){
	// parse incoming message
	let request = JSON.parse(data);
	console.log('Received request to get: ' + request.path);
	
	// read file and reply with content
	d.run(function(){
		fs.readFile(request.path, function(err, content){
			if(err) throw err;		
			console.log('Sending response content');
			responder.send(JSON.stringify({content:content.toString(), timestamp: Date.now(), pid:process.pid}));
		});
	});
});

// Listen on TCP port 5433
responder.bind('tcp://127.0.0.1:5433', function(err){
	console.log('Listening for zmq requesters...');
});

d.on('error', function(err){
	console.error(err);
	responder.send(JSON.stringify({error:err.message}));
});

// close the responder when the Node process ends
process.on('SIGINT', function(){
	close();
});

process.on('SIGTERM', function(){
	close();
});

process.on('uncaughtException', function(err){
	console.log(err);
});

function close(){
	console.log('Shutting down...');
	responder.close();
}
