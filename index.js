/*
 * Primary file for API
 *
 */
 
// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');

const config = require('./config')

// Instantiate the HTTP server
const httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
	console.log("Server is listening on port " + config.httpPort + " in " + config.envName + " mode");
});

// Instantiate HTTPS server
const key = path.join(__dirname, 'https/key.pem');
const cert = path.join(__dirname, 'https/cert.pem');

const httpsServerOptions = {
	'key': fs.readFileSync(key),
	'cert': fs.readFileSync(cert)
};

const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
	console.log("Server is listening on port " + config.httpsPort + " in " + config.envName + " mode");
});

var unifiedServer = function(req, res) {	
	// Parse requested url
	let parsedUrl = url.parse(req.url, true); 
	
	// Get path
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g, '');
	
	// Get querystring as obj
	let queryStringObject = parsedUrl.query;
	
	// Get HTTP method
	let method = req.method.toLowerCase();
	
	// Get headers as obj
	let headers = req.headers;
	
	// Get payload if exists
	let decoder = new StringDecoder('utf-8');
	let buffer = '';
	
	req.on('data', function(data) {
		buffer += decoder.write(data);
	});
	req.on('end', function() {
		buffer += decoder.end();
		
		// Choose handler
		let handler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
	
		// Construct data for handler
		let data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': buffer
		};
		
		handler(data, function(statusCode, payload) {
			
			// Check if status code exists, otherwise use default
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
			
			// Payload
			payload = typeof(payload) === 'object' ? payload : {};
			
			// Convert payload to string
			let payloadString = JSON.stringify(payload);
			
			// Send response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString)
		
			// Log
			console.log('Returning response: ', statusCode, payloadString);
		});
	});
};

let handlers = {};

handlers.ping = function(data, callback) {
	// Callback HTTP status code and a payload obj
	callback(200);
};

handlers.hello = function(data, callback) {
	// Callback HTTP status code and a payload obj
	callback(200, {"hello": "world"});
};

handlers.notFound = function(data, callback){
	callback(404);
};

let router = {
	'ping': handlers.ping,
	'hello': handlers.hello
};
