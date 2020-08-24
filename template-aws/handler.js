'use strict';

const Application = require('cerberus-mvc/System/Application');
const CorsMiddleware = require('cerberus-mvc/Middleware/Cors');
const KnexMiddleware = require('cerberus-mvc/Middleware/Knex');
const KnexService = require('cerberus-mvc/Service/Knex');

let app = new Application('aws');
let corsMiddleware = new CorsMiddleware(); 
let knexMiddleware = new KnexMiddleware(); 
let yourDBKnexService = new KnexService('postgres', '192.168.1.10', 5432, 'your_db', 'your_user', 'your_password'); 

app.service(yourDBKnexService);
app.middleware(corsMiddleware);
app.middleware(knexMiddleware);

exports.run = (event, context, callback) => app.run(event).then((response) => callback(null, response));