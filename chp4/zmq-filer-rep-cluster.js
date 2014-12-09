'use strict';

const cluster = require('cluster');
const fs = require('fs');
const zmq = require('zmq');
const os = require('os');

if (cluster.isMaster){
	// master process - create ROUTER and DEALER sockets, binds endpoints
	let router = zmq.socket('router');
	router.bind('tcp://127.0.0.1:5433');
	
	let dealer = zmq.socket('dealer');
	dealer.bind('ipc://filer-dealer.ipc');
	
	let cpuCounter = os.cpus().length;
	
	// forward messages between router and dealer
	router.on('message', function(){
		let frames = Array.prototype.slice.call(arguments);
		dealer.send(frames);
	});
	
	dealer.on('message', function(){
		let frames = Array.prototype.slice.call(arguments);
		router.send(frames);
	});
	
	// listen for workers to come online
	cluster.on('online', function(worker){
		console.log('Worker ' + worker.process.pid + ' is online.');
	});
	
	// fork three worker processes
	for(let i = 0; i < cpuCounter; i++){
		cluster.fork();
	}
	
	// If a worker dies, this event detects it and creates a new one.
	cluster.on('exit', function(worker){
		console.log('Worker ' + worker.process.pid + ' just died :\'(');
		cluster.fork();
	});
	
} else {
	// worker process - create REP socket, connect to dealer
	let responder = zmq.socket('rep');
	responder.connect('ipc://filer-dealer.ipc');
	
	responder.on('message', function(data){
		// parse incoming message
		let request = JSON.parse(data);
		console.log(process.pid + ' received request for: ' + request.path);
		
		// read file and reply with content
		fs.readFile(request.path, function(err, data){
			console.log(process.pid + ' sending response');
			
			responder.send(
			JSON.stringify({
				pid:process.pid,
				data:data.toString(),
				timestamp:Date.now()
			}));
		});
	});
}