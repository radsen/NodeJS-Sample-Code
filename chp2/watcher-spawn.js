"use strict"
const fs = require('fs');
var spawn = require('child_process').spawn;
var file = process.argv[2];

if(!file){
	throw Error("A file to watch must be specified!");	
}

fs.watch(file, function(event, filename){
	let ls = spawn('ls', ['-lh', file]); // To execute "let" --harmony is required
	ls.stdout.pipe(process.stdout);
});

console.log("Now watching " + file + " for changes...");
	