#!/usr/bin/env node --harmony
'use strict';

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('redis').createClient();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

// Express 4.x uses morgan to log in the console for dev.
app.use(morgan('dev'));
app.use(cookieParser());
  app.use(session({
  secret: 'unguessable',
  store: new RedisStore({client:redisClient}),
  resave: true,
  saveUninitialized: true
}));

app.get('/api/:name', function(req, res){
	res.status(200).json({"hello":req.params.name});
});

app.listen(3000, function(){
	console.log("ready captain.");
});

process.on('SIGINT', function(){
	console.log("Exiting gracefully :)");
	process.exit();
});