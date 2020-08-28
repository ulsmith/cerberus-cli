'use strict';

const Application = require('cerberus-mvc/System/Application');
const CorsMiddleware = require('cerberus-mvc/Middleware/Cors');
const KnexMiddleware = require('cerberus-mvc/Middleware/Knex');
const KnexService = require('cerberus-mvc/Service/Knex');

exports.run = (event, context, callback) => {
	const app = new Application('aws');
	const corsMiddleware = new CorsMiddleware(); 
	const knexMiddleware = new KnexMiddleware(); 
	const yourDBKnexService = new KnexService('postgres', '192.168.1.10', 5432, 'your_db', 'your_user', 'your_password'); 
	
	app.service(yourDBKnexService);
	app.middleware([knexMiddleware, corsMiddleware]);

	app.run(event).then((response) => callback(null, response))
};