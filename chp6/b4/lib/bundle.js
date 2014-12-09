'use strict';

const Q = require('q');
const Bundle = require('../models/bundle.js');
const Book = require('../models/book.js');

module.exports = function(config, app){
	app.post('/api/bundle', function(req, res){
		let deferred = Q.defer();
		
		let bundle_res = new Bundle();
		bundle_res.type = 'bundle';
		bundle_res.name = req.query.name;
		bundle_res.save(function(err){
			if(err){
				deferred.reject(err);
			}else{
				deferred.resolve(bundle_res);
			}
		});
		
		deferred.promise.then(function(args){
			console.log(args);
			res.send({message:'Inserted', obj:args});
		}, function(err){
			res.status(502).json({error:"bad_gateway", reason:err.code});
		});
	});
	
	app.get('/api/bundle/:id', function(req, res){
		let query = "{\"_id\":" + req.params.id + "}";
		console.log(query);
		Q.ninvoke(Bundle, 'findOne', JSON.parse(query)).then(function(results){
			res.send(results);
		}, function(err){
			console.log(err);
			res.status(502).json({error:"bad_gateway", reason:err.code});
		}).done();
	});
	
	app.put('/api/bundle/:id/name/:name', function(req, res){
		Q.ninvoke(Bundle, 'findOneAndUpdate', {_id:req.params.id}, {name:req.params.name}).then(function(results){
			console.log(results);
		}).catch(function(err){
			console.log(err);
			res.status(502).json({error:"bad_gateway", reason:err.code});
		}).done();
	});
	
	app.put('/api/bundle/:id/book/:pgid', function(req, res){
		let getBundle = Q.nfbind(Bundle.findOne.bind(Bundle));
		let getBook = Q.nfbind(Book.findOne.bind(Book));
		let put = Q.nfbind(Bundle.findOneAndUpdate.bind(Bundle));
		
		Q.async(function* (){
			let args;
			let bundle;
			let book;
			
			bundle = yield getBundle({_id:req.params.id});
			
			if(bundle === null){
				res.status(404).json({code:"404_1", message:"Bundle not found"});
				return;
			}
			
			book = yield getBook({_id:req.params.pgid});
			
			if(book === null){
				res.status(404).json({code:"404_1", message:"Book not found"});
				return;
			}
			 
			console.log(bundle.books);
			
			if(bundle.books === undefined){
				bundle["books"] = {};
			}
			
			bundle.books[book._id] = book.title; 
			args = yield put({_id:bundle._id}, {books:bundle.books}); 
			res.status(200).json(args);
						
		})().catch(function(err) { 
			console.log(err); 
			res.status(502).json({error:"bad_gateway", reason:err});
	  });
	});
	
	app.delete('/api/bundle/:id/book/:pgid',function(req, res){
		Q.async(function* (){
			let bundle = yield Q.ninvoke(Bundle, 'findOne', {_id:req.params.id});
			
			if(bundle === null){
				res.status(404).json({code:"404_1", message:"Bundle not found"});
				return;
			}
			
			if (!(req.params.pgid in bundle.books)) {
				res.status(409).json({error: "conflict", reason: "Bundle does not contain that book."});
				return;
			}
			
			delete bundle.books[req.params.pgid];
			
			let result = yield Q.ninvoke(Bundle, 'findOneAndUpdate', {_id:req.params.id}, {books:bundle.books});
			if(promise !== null)
				res.status(200).json({type:"DELETE", message:"The book was removed from the bundle", data:result});
			
		})().catch(function(err) {
			console.log(err); 
			res.status(502).json({error:"bad_gateway", reason:err});
		});
	});
}

/* Naty: 300-318-4446 */