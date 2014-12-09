"use strict";

const cluster = require('cluster');
const zmq = require('zmq');

if(cluster.isMaster){
	let pusher = zmq.socket('push');
	pusher.bind('ipc://filer-pusher.ipc');
	
	let puller = zmq.socket('pull');
	puller.bind('ipc://filer-puller.ipc');
	
	let workerReadyCounter = 0;
	
	puller.on('message', function(data){
		let message = '';
		
		try{
			message = JSON.parse(data);
		} catch (e) {
			console.error(e);
		}
		
		let sendWorkToWorkers = function(){
			for(let i = 0; i < 30; i++){
				pusher.send(JSON.stringify({index: i}));
			}
		}
		
		if(message.ready){
			workerReadyCounter += 1; 
			
			if(workerReadyCounter === 3){
				sendWorkToWorkers();
			}		
		
		} else if(message.result) {
			console.log('received: ' + data); 
		}
		
	});
	
	for(let i = 0; i < 3; i++){
		cluster.fork();
	}
	
	cluster.on('online', function(worker){
		console.log('Worker ' + worker.process.pid + ' is online');
	});
	
} else {
	let puller = zmq .socket('pull');
	puller.connect('ipc://filer-pusher.ipc');
	
	let pusher = zmq.socket('push');
	pusher.connect('ipc://filer-puller.ipc');
	
	puller.on('message', function(data){
		let job = '';
		
		try{
			job = JSON.parse(data);	
		} catch (e) {
			console.error(e);
		}
		
		console.log(process.pid + " received job: " + job.index);
		
		pusher.send(JSON.stringify({
			index: job.index,
			pid: process.pid,
			result: 'success'
		}));
	});
	
	pusher.send(JSON.stringify({
		ready:true,
		pid:process.pid
	}));
	
}