
/**
 * @namespace API/Controller/Account
 * @class Activate
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Help {

	static get title() { return 'Help' }
	static get description() { return 'Provides system help, command lists and infromation on how to use the Cerberus CLI' }
	static get command() { return 'cerberus-cli help' }
	static get arguments() { return [] }

	/**
	 * @public @static run
	 * @desciption Get the access level for the post method. All methods are restricted by default.
	 * @return {Object} Object of access levels for methods
	 */
	static run(args, actions, action) {
		let cache = [];

		console.log('')
		console.log('HELP')
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
		for (const key in actions) {
			if (cache.indexOf(actions[key].title) >= 0) continue;
			console.log(actions[key].title);
			console.log(actions[key].description);
			console.log(actions[key].command);
			console.log(actions[key].arguments);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			cache.push(actions[key].title);
		}
		console.log('')
	}
}