'use strict';

const fs = require('fs');
const zmq = require('zmq');

// create publisher end point
const publisher = zmq.socket('pub');
const theFile = process.argv[2];

fs.watch(theFile, function(event, filename){
	// send message to any subscribers
	publisher.send(JSON.stringify({type:'changed', file:theFile, timestamp:Date.now()}));
});

// Listen on TCP port 5432
publisher.bind('tcp://*:5432', function(err){
	console.log('Listening for zmq subscribers...');
});