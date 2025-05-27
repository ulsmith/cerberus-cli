const Application = require('cerberus-mvc/System/Application');
const CorsMiddleware = require('cerberus-mvc/Middleware/Cors');

module.exports = async function (context, b, c, d) {
	const app = new Application(context, 'azure');
	const corsMiddleware = new CorsMiddleware(app.globals); 
	
    app.middleware([corsMiddleware]);

    return app.run().then((response) => context.res = response);
};
