import readline from 'readline';
import fs from 'fs';
import fsx from 'fs-extra';
import replace from 'replace-in-file';
import { exec } from 'child_process';

/**
 * @namespace CLI
 * @class Init
 * @description Project initialisation
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Init {

	static get title() { return 'Init' }
	static get description() { return 'Iitialise a new cerberus project' }
	static get command() { return 'cerberus-cli init' }
	static get arguments() { return [] }

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
		console.log(`CerberusCLI - Init`);
		console.log('======================================');

		return Init.meta()
			.then((meta) => Init.structure(meta))
			.then((meta) => Init.packageJSON(meta))
			.then((meta) => Init.templateYAML(meta))
			.then((meta) => Init.swaggerJSON(meta))
			.then((meta) => Init.dockerComposeYAML(meta))
			.then((meta) => Init.readmeMD(meta))
			.then((meta) => Init.releaseMD(meta))
			.then((meta) => Init.exec(meta))
			.then((meta) => {
				console.log('');
				console.log('======================================');
				console.log(`COMPLETE > ${meta.title} [${meta.name}]`);
				console.log('======================================');
				console.log(`cd ${meta.name} > to move to project now`);
				console.log(`npm start > starts MVC server and checks for updated image every time`);
				console.log(`npm run serve > starts MVC server and skips checks for updated image`);
				console.log(`npm run swagger:up > starts swagger server`);
				console.log(`npm run swagger:down > stops swagger server`);
				console.log(`npm run package > package up system ready for deploy (supported stack types only)`);
				console.log(`npm run deploy > deploy package to production (supported stack types only)`);
				console.log('======================================');
				console.log('');
			})
			.catch((error) => {
				console.log('REMOVE THIS WHEN DONE! ', error);
				console.log('');
				console.log('ERROR');
				console.log('======================================');
				console.log(error.message);
				console.log('======================================');
				console.log('');
			});
	}

	/**
	 * @public @static meta
	 * @desciption Get meta data
	 * @return {Object} Meta data object
	 */
	static meta() {
		const capture = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})

		return new Promise((res) => capture.question(`Project title: `, (title) => res({title: title})))
			.then((data) => new Promise((res) => capture.question(`Project name (a-z, 0-9, - and _ only): `, (name) => res({ ...data, name: name }))))
			.then((data) => new Promise((res) => capture.question(`Project type, default: aws (options: aws): `, (type) => res({ ...data, type: type }))))
			.then((data) => new Promise((res) => capture.question(`Your name (author): `, (author) => res({ ...data, author: author }))))
			.then((data) => new Promise((res) => capture.question(`[OPTIONAL] Root folder/dir name (leave blank to use project name): `, (folder) => res({ ...data, folder: folder }))))
			.then((data) => new Promise((res) => capture.question(`[OPTIONAL] Description of project: `, (description) => res({ ...data, description: description }))))
			.then((data) => new Promise((res) => capture.question(`[OPTIONAL] Project license: `, (license) => res({ ...data, license: license }))))
			.then((data) => new Promise((res) => capture.question(`[OPTIONAL] Is project private, default: yes: `, (pp) => res({ ...data, private: pp }))))
			.then((data) => new Promise((res) => capture.question(`[OPTIONAL] Node version, default: >=13.0: `, (node) => res({ ...data, node: node }))))
			.then((data) => {
				capture.close()

				if (!data.type) data.type = 'aws'; 
				if (!/^[a-z0-9-_]+$/.test(data.name)) throw Error(`Project name must be in the form of 'test-name_0123'.`);
				data.private = !data.private || data.private.toLowerCase() == 'yes' ? true : false; 
				if (!data.node) data.node = '>=13.0'; 
				if (['aws'].indexOf(data.type) < 0) throw Error(`Project type must be one of available options [aws].`);
				if (!data.title || !data.name || !data.author) throw Error(`Must include title, name, type and author.`);
				
				return data;
			});
	}

	/**
	 * @public @static structure
	 * @desciption Get structure
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static structure(meta) {
		console.log('Building structure...');

		meta.path = (meta.folder || meta.name).replace(/\s/g, '_');

		// folder good?
		if (!/^[\w\-. ]+$/.test(meta.path)) throw Error(`Cannot create folder [${meta.path}] from [${meta.folder || meta.project}], invalid chars in folder name.`);
		if (fs.existsSync(process.env.PWD + '/' + meta.path)) throw Error(`Cannot create folder [${meta.path}], folder already exists.`);
		
		// create structure from template
		return Promise.resolve()
			.then(() => fsx.copy(process.env._.replace('bin/cerberus-cli', 'lib/node_modules/cerberus-cli') + '/template-' + meta.type, process.env.PWD + '/' + meta.path))
			.then(() => meta);
	}
	
	/**
	 * @public @static packageJSON
	 * @desciption Set package.json
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static packageJSON(meta) {
		console.log('Updating package.json...');

		// create structure from template
		return Promise.resolve()
			.then(() => fsx.readJson(process.env.PWD + '/' + meta.path + '/package.json'))
			.then((data) => {
				data.name = meta.name;
				data.description = meta.description;
				data.author = meta.author;
				data.license = meta.license;
				data.private = !!meta.private;
				data.scripts.deploy = data.scripts.deploy.replace('<meta.name>', meta.name);
				return data;
			})
			.then((data) => fsx.writeJson(process.env.PWD + '/' + meta.path + '/package.json', data, { spaces: '\t' }))
			.then(() => meta);
	}

	/**
	 * @public @static templateYAML
	 * @desciption Set template.yaml
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static templateYAML(meta) {
		console.log('Updating template.yaml...');

		// create structure from template
		return Promise.resolve()
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/template.yaml', from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/template.yaml', from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/template.yaml', from: '<meta.description>', to: meta.description }))
			.then(() => meta);
	}

	/**
	 * @public @static swaggerJSON
	 * @desciption Set swagger
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static swaggerJSON(meta) {
		console.log('Updating swagger.json...');

		// create structure from template
		return Promise.resolve()
			.then(() => fsx.readJson(process.env.PWD + '/' + meta.path + '/swagger.json'))
			.then((data) => {
				data.info.title = meta.title;
				data.info.description = meta.description;
				data.info.contact.name = meta.author;
				data.info.license.name = meta.license;
				data.servers[0].url = meta.type === 'aws' ? 'http://localhost:3000' : '';
				return data;
			})
			.then((data) => fsx.writeJson(process.env.PWD + '/' + meta.path + '/swagger.json', data, { spaces: '\t' }))
			.then(() => meta);
	}

	/**
	 * @public @static dockerComposeYAML
	 * @desciption Set docker-compose.yaml
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static dockerComposeYAML(meta) {
		console.log('Updating docker-compose.yaml...');
		
		// create structure from template
		return Promise.resolve()
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/docker-compose.yaml', from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/docker-compose.yaml', from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/docker-compose.yaml', from: '<meta.description>', to: meta.description }))
			.then(() => meta);
	}

	/**
	 * @public @static readmeMD
	 * @desciption Set README.md
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static readmeMD(meta) {
		console.log('Updating README.md...');

		// create structure from template
		return Promise.resolve()
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/README.md', from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/README.md', from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/README.md', from: '<meta.description>', to: meta.description }))
			.then(() => meta);
	}

	/**
	 * @public @static releaseMD
	 * @desciption Set RELEASE.md
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static releaseMD(meta) {
		console.log('Updating RELEASE.md...');

		// create structure from template
		return Promise.resolve()
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/RELEASE.md', from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/RELEASE.md', from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: process.env.PWD + '/' + meta.path + '/RELEASE.md', from: '<meta.description>', to: meta.description }))
			.then(() => meta);
	}

	/**
	 * @public @static exec
	 * @desciption Perfom executions
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static exec(meta) {
		console.log('Executing final commands...');
		
		return new Promise((res, rej) => exec(`cd ${process.env.PWD + '/' + meta.path} && npm install`, (error, stdout, stderr) => {
				if (error) return rej(error);
				if (stderr) return res(stderr);
				return res(stdout);
			}))
			.then(() => meta);
	}
}