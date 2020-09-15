import readline from 'readline';
import fs from 'fs';
import fsx from 'fs-extra';
import replace from 'replace-in-file';
import { exec } from 'child_process';
import Tools from './Tools.mjs';

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
	static get description() { return 'Initialise a new cerberus project' }
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
			.then((meta) => Init.templateFile(meta))
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
			.then((data) => new Promise((res) => capture.question(`Project type, default: aws (options: aws, express): `, (type) => res({ ...data, type: type }))))
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
				if (['aws', 'express'].indexOf(data.type) < 0) throw Error(`Project type must be one of available options [aws, express].`);
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
		if (fs.existsSync(Tools.pwd + (Tools.system === 'windows' ? '\\' : '/') + meta.path)) throw Error(`Cannot create folder [${meta.path}], folder already exists.`);
		
		// create structure from template
		return Promise.resolve()
			.then(() => {
				if (Tools.system === 'windows') return fsx.copy(Tools.pid + '\\template-' + meta.type, Tools.pwd + '\\' + meta.path);
				else return fsx.copy(Tools.pid + '/template-' + meta.type, Tools.pwd + '/' + meta.path);
			})
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
			.then(() => {
				if (Tools.system === 'windows') fsx.readJson(Tools.pwd + '\\' + meta.path + '\\package.json'); 
				else return fsx.readJson(Tools.pwd  + '/' + meta.path + '/package.json');
			})
			.then((data) => {
				data.name = meta.name;
				data.description = meta.description;
				data.author = meta.author;
				data.license = meta.license;
				data.private = !!meta.private;
				if (data.scripts && data.scripts.deploy) data.scripts.deploy = data.scripts.deploy.replace('<meta.name>', meta.name);
				return data;
			})
			.then((data) => {
				if (Tools.system === 'windows') fsx.writeJson(Tools.pwd + '\\' + meta.path + '\\package.json', data, { spaces: '\t' });
				else return fsx.writeJson(Tools.pwd + '/' + meta.path + '/package.json', data, { spaces: '\t' });
			})
			.then(() => meta);
	}

	/**
	 * @public @static templateFile
	 * @desciption Set template.yaml
	 * @param {Object} meta Meta data object
	 * @return {Object} Meta data object
	 */
	static templateFile(meta) {
		if (meta.type === 'aws') {
			console.log('Updating template.yaml...');
	
			// create structure from template
			return Promise.resolve()
				.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\template.yaml` : `/${meta.path}/template.yaml`), from: '<meta.name>', to: meta.name }))
				.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\template.yaml` : `/${meta.path}/template.yaml`), from: '<meta.title>', to: meta.title }))
				.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\template.yaml` : `/${meta.path}/template.yaml`), from: '<meta.description>', to: meta.description }))
				.then(() => meta);
		} else if (meta.type === 'express') {
			console.log('Updating template.json...');
	
			// create structure from template
			return Promise.resolve()
				.then(() => fsx.readJson(Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\template.json` : `/${meta.path}/template.json`)))
				.then((data) => {
					data.global.environment.API_NAME = data.global.environment.API_NAME + '-' + meta.name;
					return data;
				})
				.then((data) => fsx.writeJson(Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\template.json` : `/${meta.path}/template.json`), data, { spaces: '\t' }))
				.then(() => meta);
		}
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
			.then(() => fsx.readJson(Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\swagger.json` : `/${meta.path}/swagger.json`)))
			.then((data) => {
				data.info.title = meta.title;
				data.info.description = meta.description;
				data.info.contact.name = meta.author;
				data.info.license.name = meta.license;
				data.servers[0].url = meta.type === 'aws' ? 'http://localhost:3000' : '';
				return data;
			})
			.then((data) => fsx.writeJson(Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\swagger.json` : `/${meta.path}/swagger.json`), data, { spaces: '\t' }))
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
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\docker-compose.yaml` : `/${meta.path}/docker-compose.yaml`), from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\docker-compose.yaml` : `/${meta.path}/docker-compose.yaml`), from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\docker-compose.yaml` : `/${meta.path}/docker-compose.yaml`), from: '<meta.description>', to: meta.description }))
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
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\README.md` : `/${meta.path}/README.md`), from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\README.md` : `/${meta.path}/README.md`), from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\README.md` : `/${meta.path}/README.md`), from: '<meta.description>', to: meta.description }))
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
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\RELEASE.md` : `/${meta.path}/RELEASE.md`), from: '<meta.name>', to: meta.name }))
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\RELEASE.md` : `/${meta.path}/RELEASE.md`), from: '<meta.title>', to: meta.title }))
			.then(() => replace({ files: Tools.pwd + (Tools.system === 'windows' ? `\\${meta.path}\\RELEASE.md` : `/${meta.path}/RELEASE.md`), from: '<meta.description>', to: meta.description }))
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
		
		return new Promise((res, rej) => exec(`cd ${Tools.system === 'windows' ? Tools.pwd + '\\' + meta.path : Tools.pwd + '/' + meta.path} && npm install`, (error, stdout, stderr) => {
				if (error) return rej(error);
				if (stderr) return res(stderr);
				return res(stdout);
			}))
			.then(() => meta);
	}
}