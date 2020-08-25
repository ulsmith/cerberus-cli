import fsx from 'fs-extra';

/**
 * @namespace CLI
 * @class Tools
 * @description Basic tools that do not belong to its own class
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Tools {

	static get title() { return 'Tools' }
	static get description() { return 'Iitialise a new cerberus project' }
	static get command() { return 'cerberus-cli [argument]' }
	static get arguments() { return ['-v', '--version', '-h', '--help'] }

	/**
	 * @public @static run
	 * @desciption Perform action from command
	 * @param {Array} args Arguments passed in to command
	 * @param {Object} actions All actions for CLI
	 * @param {String} action The action chosen on CLI
	 */
	static run() {
		console.log('');
		console.log('======================================');
		console.log(`CerberusCLI - Tools`);
		console.log('======================================');

		return Tools.packageJSON()
			.then((data) => {
				console.log(`Version: ${data.version}`);
				console.log('======================================');
				console.log('');
			});
	}

	/**
	 * @public @static packageJSON
	 * @desciption Get package data
	 * @return {Object} Meta data object
	 */
	static packageJSON() {
		// create structure from template
		return fsx.readJson(process.env._.replace('bin/cerberus-cli', 'lib/node_modules/cerberus-cli/package.json'));
	}
}