"use strict"
const fs = require('fs');
var spawn = require('child_process').spawn;
var file = process.argv[2];

if(!file){
	throw Error("A file to watch must be specified!");	
}

fs.watch(file, function(event, filename){
	let ls = spawn('ls', ['-lh', file]);
	let output = '';
	ls.stdout.on('data', function(chunk){
		output += chunk.toString();
	});
	
	ls.on('close', function(){
		let parts = output.split(/\s+/);
		console.dir([parts[0], parts[4], parts[8]]);
	});
});

console.log("Now watching " + file + " for changes...");