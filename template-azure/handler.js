const Application = require('cerberus-mvc/System/Application');
const CorsMiddleware = require('cerberus-mvc/Middleware/Cors');

module.exports = async function (context, b, c, d) {
	const app = new Application('azure');
	const corsMiddleware = new CorsMiddleware(); 
	
    app.middleware([corsMiddleware]);

    return app.run(context).then((response) => context.res = response);
};
