'use strict';

const os = require("os");
const cluster = require("cluster");
const clusterWorkerSize = os.cpus().length;

const Application = require('cerberus-mvc/System/Application');
const CorsMiddleware = require('cerberus-mvc/Middleware/Cors');
const KnexMiddleware = require('cerberus-mvc/Middleware/Knex');
const KnexService = require('cerberus-mvc/Service/Knex');

const express = require('express');
const requestIp = require('request-ip');
const bodyParser = require('body-parser');
const PORT = 8082;
const server = express();

if (clusterWorkerSize > 1) {
	if (cluster.isMaster) {
		for (let i = 0; i < clusterWorkerSize; i++) cluster.fork()
		cluster.on("exit", (worker) => console.log("Worker", worker.id, " has exitted."));
	} else process();
} else process();

function process() {
	server.use(requestIp.mw())
	server.use(bodyParser.urlencoded({ extended: false }))
	server.use(bodyParser.json())

	server.use('/', (req, res) => {
		let app = new Application('express');
		let corsMiddleware = new CorsMiddleware();
		let knexMiddleware = new KnexMiddleware();
		let yourDBKnexService = new KnexService('postgres', '192.168.1.10', 5432, 'your_db', 'your_user', 'your_password');

		app.service(yourDBKnexService);
		app.middleware(corsMiddleware);
		app.middleware(knexMiddleware);

		return app.run(req).then((response) => res.set(response.headers).status(response.status).send(response.body));
	});

	// Start
	server.listen(PORT, () => console.log('Running on http://localhost:' + PORT));
}