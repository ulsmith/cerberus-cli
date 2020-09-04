var assert = require('assert');
var request = require('supertest'); // http requests

const SERVER = process.env.SERVER;
const ORIGIN = process.env.ORIGIN;

describe('Controller Endpoint Test [/Health]', function () {
	describe('GET', function () {
		it('Should return generic health status message', function (done) {
			request(SERVER)
			.get('/health')
			.send()
			.set({'Accept': 'application/json', 'Origin': ORIGIN})
			.end(function (err, res) {
				// check status
				assert.equal(res.statusCode, 200);

				// check headers
				assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
				assert.equal(res.headers['cache-control'], 'no-cache');
				assert.equal(res.headers['pragma'], 'no-cache');
				assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
				assert.equal(res.headers['access-control-allow-credentials'], 'true');
				assert.equal(res.headers['access-control-allow-headers'], 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires');
				assert.equal(res.headers['access-control-allow-methods'], 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
				assert.equal(res.headers['access-control-expose-headers'], 'Cache-Control, Content-Type, Authorization, Pragma, Expires');

				// check response type
				assert.ok(typeof res.body === 'object' && !res.body.length);
				assert.ok(res.body.name);
				assert.ok(res.body.version);
				assert.ok(res.body.mode);
				assert.ok(res.body.status);
				assert.ok(res.body.dateTime);

				// check response data
				assert.equal(res.body.status, 'healthy');

				// finish
				done();
			});
		});
	});
});