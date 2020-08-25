
/**
 * @namespace CLI
 * @class Help
 * @description List help from each class
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
	 * @desciption Perform action from command
	 * @param {Array} args Arguments passed in to command
	 * @param {Object} actions All actions for CLI
	 * @param {String} action The action chosen on CLI
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
			if (actions[key].tasks) console.log(actions[key].tasks);
			if (actions[key].arguments) console.log(actions[key].arguments);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			cache.push(actions[key].title);
		}
		console.log('')
	}
}