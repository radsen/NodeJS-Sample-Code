const fs = require('fs');
var filename = process.argv[2];

if(!filename){
	throw Error("A file to watch must be specified!");
}

// Watch is marked as unstable
fs.watch(filename, function(event, filename){
	console.log("File: " + filename + " just changed!");
});

console.log("Now watching " + filename + " for changes...");