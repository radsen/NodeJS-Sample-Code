'use strict';

const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));

const config = {
	bookdb:'mongodb://localhost/Books/', 
	b4db:'mongodb://localhost/b4/'
};

mongoose.connect(config.bookdb);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

require('./lib/book-search.js')(config, app);
require('./lib/field-search.js')(config, app);
require('./lib/bundle.js')(config, app);

process.on('SIGINT', function(){
	console.log("Exiting gracefully :)");
	process.exit();
});

app.listen(3000, function(){
  console.log("ready captain.");
});