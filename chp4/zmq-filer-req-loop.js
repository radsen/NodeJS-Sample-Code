"use strict";

const zmq = require('zmq');
const filename = process.argv[2];

// create request endpoint.
const requester = zmq.socket('req');

// handle replies from responder
requester.on("message", function(data){
	let response = JSON.parse(data);
	console.log("Received response: ", response);
});

requester.connect("tcp://localhost:5433");

// send request for content
for (let i = 1; i <= 3; i++){
	console.log('Sending request' + i + ' for ' + filename);
	requester.send(JSON.stringify({
		path:filename
	}));	
}

/* 
Note the for loop is to show a problem with the requests, the responder will always be aware of one request at a time. We need to use 0MQ ROUTER and DEALER sockets for parallel REQ/REP.	
*/