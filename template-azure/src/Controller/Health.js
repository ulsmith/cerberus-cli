'use strict';

const Controller = require('cerberus-mvc/Base/Controller');

/**
 * @namespace API/Controller
 * @class Health
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Health extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();
    }

	/**
	 * @public @static @get access
	 * @desciption Get the access for methods. All methods are restricted by default unless specifically set as 'public'.
	 * @return {Object} Object of access levels for methods
	 */
	static get get() { return { level: 'public' } }

    /**
     * @public @method get
     * @description Ping the system to check whats health and whats not
     * @param {*} request The request that caused the controller to run
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(request) {
		return {
			name: this.$environment.API_NAME,
			version: this.$environment.API_VERSION,
			mode: this.$environment.API_MODE,
			status: 'healthy',
			dateTime: new Date(),
		};
	}
}

module.exports = Health;
