#!/usr/bin/env node --harmony
'use strict';

const log = require('npmlog');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google').Strategy;
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('redis').createClient();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

const User = require('./models/user.js');

redisClient
  .on('ready', function() { log.info('REDIS', 'ready'); })
  .on('error', function(err) { log.error('REDIS', err.message); });

passport.serializeUser(function(user, done) {
  done(null, user.identifier);
});

passport.deserializeUser(function(id, done) {
  done(null, { identifier: id });
});

passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:3000/auth/google/return',
    realm: 'http://localhost:3000/'
  },
  function(identifier, profile, done) {
  	console.log("My profile: " + profile);
  	profile.identifier = identifier;
    return done(null, profile);
  }
));

app.use(morgan('dev'));
app.use(cookieParser());
  app.use(session({
  secret: 'unguessable',
  store: new RedisStore({client:redisClient}),
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/bower_components'));

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

app.get('/auth/google/:return?', passport.authenticate('google', {successRedirect:'/'}));
app.get('/auth/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

const authed = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else if(redisClient.ready){
		res.status(403).json({error:"forbidden", reason:"not_authenticated"});
	} else {
		res.status(503).json({error:"service_unavailable", reason:"authentication_unavailable"});
	}
};

app.get('/api/user', authed, function(req, res){
	res.json(req.user);
});

app.get('/api/user/bundles', authed, function(req, res){
	User.findOne({oauthID:req.user.identifier}, function(err, user){
		if(err){
			console.log(err);
			return;
		}
		if(!err && user === null){
			let newUser = new User({
				oauthID:req.user.identifier,
				name:req.user.firstname + " " + req.user.lastname,
				created:new Date().toJSON()
			});
			newUser.save(function(err){
				if(err){
					console.log(err);
				}
			});
		}
		
		res.status(200).json(user.bundles);
	});
});

app.put('/api/user/bundles', authed, function(req, res){
	User.findOne({oauthID:req.user.identifier}, function(err, user){
		if(err){
			console.log(err);
			return;
		}
		
		user.bundles = req.body;
		User.findOneAndUpdate({oauthID:user.oauthID}, {bundles:req.body}, function(err, data){
			if(err){
				console.log(err);
				return;
			}
			
			console.log(data);
			res.status(200).json(data);
		});
	});
});

process.on('SIGINT', function(){
	console.log("Exiting gracefully :)");
	process.exit();
});

app.listen(3000, function(){
  console.log("ready captain.");
});