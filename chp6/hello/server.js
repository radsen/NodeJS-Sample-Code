#!/usr/bin/env node --harmony
'use strict';

const express = require('express');
const morgan = require('morgan');
const app = express();

// Express 4.x uses morgan to log in the console for dev.
app.use(morgan('dev'));
app.get('/api/:name', function(req, res){
	/* res.json(200, {"hello":req.params.name}); deprecated */
	res.status(200).json({"hello":req.params.name})
});

app.listen(3000, function(){
	console.log("ready captain.");
});

process.on('SIGINT', function(){
	console.log("Exiting gracefully :)");
	process.exit();
});