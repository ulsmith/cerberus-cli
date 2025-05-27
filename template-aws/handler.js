'use strict';

const Application = require('cerberus-mvc/System/Application');
const CorsMiddleware = require('cerberus-mvc/Middleware/Cors');
const KnexMiddleware = require('cerberus-mvc/Middleware/Knex');
const KnexService = require('cerberus-mvc/Service/Knex');

exports.run = (event, context, callback) => {
	const app = new Application(event, 'aws');
	const corsMiddleware = new CorsMiddleware(app.globals); 
	const knexMiddleware = new KnexMiddleware(app.globals); 
	const yourDBKnexService = new KnexService('postgres', '192.168.1.10', 5432, 'your_db', 'your_user', 'your_password'); 
	
	app.service(yourDBKnexService);
	app.middleware([knexMiddleware, corsMiddleware]);

	app.run().then((response) => callback(null, response))
};