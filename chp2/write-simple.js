const fs = require('fs');
fs.writeFile('target.txt', 'A witty message', function(err){
	if(err){
		throw err;
	}
	
	console.log("File saved!")
});