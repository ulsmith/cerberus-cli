import fsx from 'fs-extra';
import path from 'path';

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
	static get description() { return 'Tools providing basic functionality on cerberus-cli' }
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
		console.log(`                                                                 `);
		console.log(`                                                                 `);
		console.log(`                     .'        '.                                `);
		console.log(`                     oKo'....,xKc                                `);
		console.log(`                    ,OMWXKKKKNMWx.                               `);
		console.log(`                   'OWMMMMMMMMMMWk.                              `);
		console.log(`         'ol.      .xNXNMMMMMMNXNd       .ll.                    `);
		console.log(`       .c0WWk,.     cK0KMMMMMW00K;     .;OWWO;.                  `);
		console.log(`   .';dO0NMMMN0o,   .OMMMMMMMMMWx.  .,dKWMMMX0ko;..              `);
		console.log(`,okKNWMWWWMMMMMMNx'  ,OWMMMMMMWk'  ,kNMMMMMMWWWMWX0xl'           `);
		console.log(`;KW0xxk0KXNWMMMMMMKl.,xKNMMMMN0d'.dXMMMMMMWNXKOkxx0W0,           `);
		console.log(` ,:.    .,xNMMMMMMMWKKWNKXXXXKNWKXWMMMMMMMXd'.    .:'            `);
		console.log(`    ....;kNMMMMMMMMMMMMMMWWWWMMMMMMMMMMMMMMNx'...                `);
		console.log(`   .dK0O0kolookXMMMMMMMMMMMMMMMMMMMMMMXxoolok0O00l.              `);
		console.log(`    'oo;.     .xMMMMMMMMMMMMMMMMMMMMMWo      .:oo.               `);
		console.log(`               cXWNNWWWWWWWWWWWWWWWWWK;                          `);
		console.log(`               .'''''''''''''''''''''.                           `);
		console.log(`                                                                 `);
		console.log(`                 CerberusCLI - Tools                             `);
		console.log('');
		console.log('======================================');
		console.log(`System: ${Tools.system}`);
		console.log(`Install path: ${Tools.pid}`);
		console.log(`Working path: ${Tools.pwd}`);
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
		if (Tools.system === 'windows') return fsx.readJson(Tools.pid + '\\package.json'); 
		else return fsx.readJson(Tools.pid + '/package.json');
	}

	/**
	 * @public @static system
	 * @desciption Get system type
	 */
	static get system() {
		if (process.env.OS && process.env.OS.toLowerCase().indexOf('windows') >= 0) return 'windows';
		else if (process.env.PWD) return 'unix';
		else return 'unknown';
	}

	/**
	 * @public @static pwd
	 * @desciption Get working directory
	 */
	static get pwd() {
		return process.cwd();
	}

	/**
	 * @public @static pid
	 * @desciption Get installed directory
	 */
	static get pid() {
		if (process.env.APPDATA) return process.env.APPDATA + '\\npm\\node_modules\\cerberus-cli';
		else if (process.env._) return process.env._.replace('bin/cerberus-cli', 'lib/node_modules/cerberus-cli');
		else return '/usr/lib/node_modules/cerberus-cli';
	}
}