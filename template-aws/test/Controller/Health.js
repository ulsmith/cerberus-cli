var assert = require('assert');
var request = require('supertest'); // http requests

const server = 'http://localhost:3000'

describe('Controller Endpoint Test [/Health]', function () {
	describe('GET', function () {
		it('Should return generic health status message', function (done) {
			request(server)
			.get('/health')
			.send()
			.set({'Accept': 'application/json', 'Origin': 'http://localhost'})
			.end(function (err, res) {
				// check status
				assert.equal(res.statusCode, 200);

				// check headers
				assert.equal(res.headers['content-type'], 'application/json');
				assert.equal(res.headers['cache-control'], 'no-cache');
				assert.equal(res.headers['pragma'], 'no-cache');
				assert.equal(res.headers['access-control-allow-origin'], 'http://localhost');
				assert.equal(res.headers['access-control-allow-credentials'], 'true');
				assert.equal(res.headers['access-control-allow-headers'], 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires');
				assert.equal(res.headers['access-control-allow-methods'], 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
				assert.equal(res.headers['access-control-expose-headers'], 'Cache-Control, Content-Type, Authorization, Pragma, Expires');

				// check response type
				assert.ok(typeof res.body === 'object' && !res.body.length);
				assert.ok(res.body.database);
				assert.ok(res.body.internet);
				assert.ok(res.body.system);
				assert.ok(res.body.dateTime);
				
				// check response data
				assert.equal(res.body.database[0].name, 'sourcing');
				assert.equal(res.body.database[0].status, 'healthy');
				assert.equal(res.body.database[1].name, 'client');
				assert.equal(res.body.database[1].status, 'healthy');
				assert.equal(res.body.database[2].name, 'product');
				assert.equal(res.body.database[2].status, 'healthy');
				assert.equal(res.body.internet, 'yes');
				assert.equal(res.body.system, 'healthy');

				// finish
				done();
			});
		});
	});
});