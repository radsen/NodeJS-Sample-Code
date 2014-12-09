'use strict';

const Book = require('../models/book.js');

module.exports = function(config, app){
	app.get('/api/search/:view', function(req, res){
		let view = req.params.view;
		
		if(view === 'authors' || view === 'subjects'){
			
			let query = {};
			query[view] = { "$regex": req.query.q, "$options": "i" }; 

			Book.find( query , function(errs, books){
				if(errs){
					res.status(502).json({error:"bad_gateway", reason:err.code});
					return;
				}
			
				res.json(books);
			});
			
		} else {
			res.status(400).json({error:"bad_request", reason:'The view entered does not exist ' + view});
		}			
	});
}
