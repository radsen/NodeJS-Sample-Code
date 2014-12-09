const fs = require('fs');

// Watch is marked as unstable, never retrieves the filename.
fs.watch('target.txt', function(event, filename){
	console.log("event is: " + event);
	if(filename){
		console.log("filename provided: " + filename);
	}else{
		console.log("filename not provided.");
	}
});

console.log("Now watching target.txt for changes...");