'use strict';

const fs = require('fs');
const cheerio = require('cheerio');

module.exports = function(filename, callback){
	fs.readFile(filename, function(err, data){
		if(err){
			return callback(err);
		}
		
		// {xmlMode:true} added as a parameter in order to parse the RDF correctly.
		let $ = cheerio.load(data.toString(), {xmlMode:true});
			let collect = function(index, elem){
			return $(elem).text()
		};
		
		callback(null, {
			_id:$('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', ''),
			title:$('dcterms\\:title').text(),
			authors:$('pgterms\\:agent pgterms\\:name').map(collect).toArray(),
			//subjects:$('[rdf\\:resource$="/LCSH"] ~ rdf\\:value').map(collect).toArray()
			
			// The commented line above belongs to the original code which comes with the book.
			// I replace the sibiling symbol(~) for the funtion to get the sibilings correctly and turned them into an Array
			// to get the right output without the options that came in one of creerios versions. 
			subjects : $('[rdf\\:resource$="/LCSH"]').siblings('rdf\\:value').map(collect).toArray()
		});
	});
};