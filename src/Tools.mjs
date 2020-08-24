import readline from 'readline';
import fs from 'fs';
import fsx from 'fs-extra';
import replace from 'replace-in-file';
import { exec } from 'child_process';

/**
 * @namespace API/Controller/Account
 * @class Activate
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
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
	 * @desciption Start process
	 */
	static run(args) {
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
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static packageJSON() {
		// create structure from template
		return fsx.readJson(process.env._.replace('bin/cerberus-cli', 'lib/node_modules/cerberus-cli/package.json'));
	}
}