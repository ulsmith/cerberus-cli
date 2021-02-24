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
    static get socket() { return 'public' } // when using an auth middleware you can sniff this to set access levels on methods!!

    /**
     * @public @method get
     * @description Ping the system to check whats health and whats not
     * @param {*} request The cerberus-mvc request object
     */
	socket(request) {
		// Sockets to not return data!

		// You can do this from any class that extends a cerberus class!!!

		// Want to update all users but not form an incomming request? Create a middleware/service that can emit directly from there when someone logs in or authenticates!

		// emit a message to the room 'log' on the person that made this request only 
		this.$socket.emit('log', 'me only\n', 34, { test: 'fsdfsdfsd' });

		// emit a message to the room 'log' for everyone in the room
		this.$io.emit('log', 'everyone\n');

		// emit a message to the room 'log' for everyone else but me
		this.$socket.broadcast.emit('log', 'not me\n');
	}
}

module.exports = Health;
