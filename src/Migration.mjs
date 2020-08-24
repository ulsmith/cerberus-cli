import fs from 'fs';
import Knex from 'knex';

// what context are we running against
const server = process.env.SERVER;

// DATABASES

var databases;
try {
	let dbFileData = fs.readFileSync(`./migration${server ? '.' + server : ''}.json`);
	databases = JSON.parse(dbFileData);
} catch (error) {
	console.log('');
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	console.log('ERROR PARSING MIGRATION DATABASE FILE');
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	console.log(error.message);
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	console.log('');
}

// sort out args
if (!process.argv || (process.argv.length < 3)) throw ('Please specify a migration task [prepare/up/down]... `node migration -- prepare`... `node migration -- up xyz`');
const task = process.argv[2];
const dbname = process.argv[3] && !/[0-9]{12,20}/.test(process.argv[3]) && process.argv[3].indexOf('I_WANT_TO_DESTROY_DATABASES') < 0 ? process.argv[3] : undefined;
const migration = dbname ? (/[0-9]{12,20}/.test(process.argv[4]) ? process.argv[4] : undefined) : (/[0-9]{12,20}/.test(process.argv[3]) ? process.argv[3] : undefined);
const imBonkersYesNuts = dbname && migration ? process.argv[5] : (dbname || migration ? process.argv[4] : process.argv[3]);

/**
 * @class Migration
 * @description Migration multiple databases in one go. Runs from a untracked migration.json files to specify database connections
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Migration {
	static _connect(database) {
		return new Knex({ client: database.engine, connection: database });
	}

	/**
	 * @public @method health
	 * @description Check database health
	 * @param {String} migration The migration name to use e.g. testing, production
	 * @param {String} dbname The database name to check e.g. mydatabase
	 */
	static async health(migration, dbname) {
		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('HEALTH' + (dbname ? ' FOR ' + dbname : ''));
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');

		if (dbname && !databases.find((db) => db.database === dbname)) console.log('UKNOWN DATABASE ' + dbname);

		for await (const database of databases) {
			if (dbname && dbname !== database.database) continue;
			let db = Migration._connect(database);

			// test connection with a query
			await db.raw('SELECT now()')
				.then(() => console.log('...Database (' + database.engine + ') ' + database.database + ' on ' + database.host + ' port ' + database.port + ' is healthy'))
				.catch(() => console.log('...ERROR: Database (' + database.engine + ') ' + database.database + ' on ' + database.host + ' port ' + database.port + ' is not reachable'));

			db.destroy();
		}

		let ran = [];
		for await (const database of databases) {
			if (ran.indexOf(database.host + database.port) >= 0) continue;
			ran.push(database.host + database.port);
			let db = Migration._connect(database);

			// test connection with a query
			await db.raw('SELECT * from pg_stat_activity').then((data) => {
					console.log('');
					console.log(('--- Process List for ' + database.host + ' port ' + database.port + ' ---').replace(/./g, '-'))
					console.log('--- Process List for ' + database.host + ' port ' + database.port + ' ---');
					console.log(('--- Process List for ' + database.host + ' port ' + database.port + ' ---').replace(/./g, '-'))
					for (const row of data.rows) console.log(`PID:${row.pid} - DBID:${row.datid} - DBNAME:${row.datname} - UNAME:${row.usename} - APPNAME:${row.application_name} CADDR:${row.client_addr}`);
					console.log(('--- Process List for ' + database.host + ' port ' + database.port + ' ---').replace(/./g, '-'))
					console.log('');
				})
				.catch(() => console.log('...ERROR: Connecting to ' + database.host + ' port ' + database.port));

			db.destroy();
		}

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('COMPLETE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');
	}

	/**
	 * @public @method list
	 * @description List all migrations
	 * @param {String} migration The migration name to use e.g. testing, production
	 * @param {String} dbname The database name to check e.g. mydatabase
	 */
	static async list(migration, dbname) {
		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('LIST' + (dbname ? ' FOR ' + dbname : ''));
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');

		if (dbname && !databases.find((db) => db.database === dbname)) console.log('UKNOWN DATABASE ' + dbname);
		let files = Migration._getFilesToMigration('./migration');

		for await (const database of databases) {
			if (dbname && dbname !== database.database) continue;

			// connect DB
			let db = Migration._connect(database);
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log(database.database + ' Migration List');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');

			// grab all migrations
			await db.select().from('public.migrate').catch(() => { }).then(async (data) => {
					let c = 0;
					let ups = 0;
					for await (const file of files) {
						// check file not ran against db
						const fd = fs.readFileSync(file, 'utf8');
						const fdMeta = fd.split('-- @up')[0];
						const fdUp = fd.split('-- @up')[1].split('-- @down')[0];
						const fdDown = fd.split('-- @up')[1].split('-- @down')[1];

						// check timestamp and database name
						try {
							const dbName = fdMeta.match("-- @database (.*)")[1];
							const dbTimestamp = fdMeta.match("-- @timestamp (.*)")[1];
							if (!database.database) throw Error('Cannot resolve database name in file [' + file + ']');
							if (database.database !== dbName) continue;
							if (file.indexOf(dbTimestamp) < 0) throw Error('Timestamp missmatch between filename and file meta data [' + file + ']');
						} catch (error) {
							if (error.message) console.log(error.message);
							throw error;
						}

						// check if migration already complete, ignore if is, also dont shit if no data as might be first migration that includes migration table!
						let row;
						try {
							row = data.find((row) => row.name_unique === file);
							c++;
							if (row) {
								if (row.completed) {
									console.log(
										(c < 10 ? '000' + c : (c < 100 ? '00' + c : (c < 1000 ? '0' + c : c))) 
										+ ' UP      > [' + file + '] last completed "' + row.data.action + '" on ' 
										+ row.completed.toISOString().replace(/T/, ' ').replace(/\..+/, '')
									);
									ups++;
								} else {
									console.log(
										(c < 10 ? '000' + c : (c < 100 ? '00' + c : (c < 1000 ? '0' + c : c))) 
										+ ' DOWN    > [' + file + '] not complete "' + row.data.action + '" on ' 
										+ row.updated.toISOString().replace(/T/, ' ').replace(/\..+/, '')
									);
								}
							} else throw Error();
						} catch (error) { console.log('.....PENDING > [' + file + ']') }
					}

					console.log('');
					console.log(`${ups === c ? 'TOTAL' : 'NOTICE'}: ${ups} out of ${c} migrations are "up"`);
					console.log('');
					
					const missing = data.filter((row) => !files.find((file) => file === row.name_unique));
					for (const miss of missing) console.log('WARNING: [' + miss.name_unique + '] missing from migrate folder! last completed "' + miss.data.action + '" on ' + miss.completed.toISOString().replace(/T/, ' ').replace(/\..+/, ''));
				})
				.catch(() => {});

			db.destroy();
		}

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('COMPLETE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');
	}

	/**
	 * @public @method prepare
	 * @description Prepare any migrations by checking and marging and renaming
	 */
	static prepare() {
		let files = Migration._getFilesToPrepare('./migration');
		let timestamp = Date.now();

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('PREPARE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');

		try {
			for (const file of files) {
				// skip prepared files
				if (/prepared-[0-9]{12,20}--[a-zA-Z0-9_-]+\.sql/.test(file)) {
					console.log('...Skipping prepared migration file [' + file + ']');
					continue;
				}
	
				// throw error on bad file names
				const parts = file.split('/');
				const name = parts.pop();
				if (!/^[a-zA-Z0-9_-]+\.sql$/.test(name)) throw Error('Cannot prepare file, invalid filename "' + name + '" [' + file + ']');
	
				// generate unqie timestamp per file
				let ts = Date.now();
				while (timestamp >= ts) { ts = Date.now() };
				timestamp = ts;
				
				// update file and rename too
				const text = fs.readFileSync(file, 'utf8');
	
				// check we have a database, up, down and begin commit in file
				try {
					const dbName = text.match("-- @database (.*)");
					const dbUp = text.match("-- @up");
					const dbDown = text.match("-- @down");
					if (!dbName || dbName[1].length < 2) throw Error('Cannot resolve database name in file [' + file + ']');
					if (!dbUp || dbUp[0] !== '-- @up') throw Error('Cannot find \'-- @up\' section in migrate file [' + file + ']');
					if (!dbDown || dbDown[0] !== '-- @down') throw Error('Cannot find \'-- @down\' section in migrate file [' + file + ']');
				} catch (error) {
					console.log(error.message);
					return;
				}
	
				const data = fs.readFileSync(file);
				const fd = fs.openSync(file, 'w+')
				const insert = new Buffer.from(`-- @timestamp ${timestamp}\n`)
				fs.writeSync(fd, insert, 0, insert.length, 0)
				fs.writeSync(fd, data, 0, data.length, insert.length)
				fs.close(fd, (err) => { if (err) throw err });
				fs.renameSync(file, parts.join('/') + '/prepared-' + timestamp + '--' + name);
				console.log('...Prepared migration file [prepared-' + timestamp + '--' + name + '] from [' + file + ']');
			}
		} catch (error) {
			console.log(error.message);
		}

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('COMPLETE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');
	}

	/**
	 * @public @method parse
	 * @description Parse a specific SQL file, handy when wanting to pre set data in a new database
	 * @param {String} migration The migration name to use e.g. testing, production
	 * @param {String} dbname The database name to check e.g. mydatabase
	 */
	static async parse(migration, dbname) {
		if (dbname && !databases.find((db) => db.database === dbname)) {
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('UKNOWN DATABASE ' + dbname);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
		}

		// get all prepared migrations
		migration = dbname ? process.argv[4] : process.argv[3];
		let file = migration;

		for await (const database of databases) {
			if (dbname && dbname !== database.database) continue;

			// connect DB
			let db = Migration._connect(database);
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('PARSE SQL on ' + database.database);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');

			// check file not ran against db
			const fd = fs.readFileSync(file, 'utf8');
			const fdMeta = fd.split('-- @parse')[0];
			const fdParse = fd.split('-- @parse')[1];

			// check timestamp and database name
			let dbName, mgName;
			try {
				dbName = fdMeta.match("-- @database (.*)")[1];
				mgName = fdMeta.match("-- @name (.*)")[1];
				if (!database.database) throw Error('Cannot resolve database name in file [' + file + ']');
				if (database.database !== dbName) throw Error('Cannot parse SQL against "' + database.database + '" database name in file is "' + dbName + '"');
				if (!mgName) throw Error('Cannot resolve migration name in file [' + file + ']');
			} catch (error) {
				if (!dbName || !mgName) console.log('Meta data missing from parsable file');
				else if (error.message) console.log(error.message);
				throw Error('Undefined error'); // only allow from or to with dbname
			}
			
			// migration search
			if (migration) {
				// check basic
				if (!dbname) {
					console.log('');
					console.log('Must use database name with specific migrations');
					console.log('');
					throw Error(); // only allow from or to with dbname
				}

				try {
					await db.raw(fdParse);
					console.log('...Completed PARSE of SQL file [' + file + ']');
				} catch (error) {
					console.log('Error with message: ' + error.message);
				}
			}

			await db.destroy();
		}

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('COMPLETE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');
	}

	/**
	 * @public @method up
	 * @description Bring all prepared migrations up
	 * @param {String} migration The migration name to use e.g. testing, production
	 * @param {String} dbname The database name to check e.g. mydatabase
	 */
	static async up(migration, dbname) {
		if (dbname && !databases.find((db) => db.database === dbname)) {
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('UKNOWN DATABASE ' + dbname);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
		}

		// get all prepared migrations
		let files = Migration._getFilesToMigration('./migration');

		for await (const database of databases) {
			if (dbname && dbname !== database.database) continue;

			// connect DB
			let db = Migration._connect(database);
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('UP on ' + database.database);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');

			// grab all migrations
			await db.select().from('public.migrate').catch(() => { }).then(async (data) => {
				for await (const file of files) {
					// check file not ran against db
					const fd = fs.readFileSync(file, 'utf8');
					const fdMeta = fd.split('-- @up')[0];
					const fdUp = fd.split('-- @up')[1].split('-- @down')[0];
					const fdDown = fd.split('-- @up')[1].split('-- @down')[1];

					// check timestamp and database name
					let dbName, dbTimestamp, mgName;
					try {
						dbName = fdMeta.match("-- @database (.*)")[1];
						dbTimestamp = fdMeta.match("-- @timestamp (.*)")[1];
						mgName = fdMeta.match("-- @name (.*)")[1];
						if (!database.database) throw Error('Cannot resolve database name in file [' + file + ']');
						if (database.database !== dbName) continue;
						if (file.indexOf(dbTimestamp) < 0) throw Error('Timestamp missmatch between filename and file meta data [' + file + ']');
						if (!mgName) throw Error('Cannot migration name in file [' + file + ']');
					} catch (error) {
						if (error.message) console.log(error.message);
						throw error;
					}

					// migration search
					if (migration) {
						// check basic
						if (!dbname) {
							console.log('');
							console.log('Must use database name with specific migrations');
							console.log('');
							throw Error(); // only allow from or to with dbname
						}

						// only do single migration
						const migs = migration.split(':');
						let from = migs[0];
						let to = migs[1];

						// single
						if (from && !to) if (from !== dbTimestamp) continue;
						if (!from && to) if (to !== dbTimestamp) continue;
						
						// range
						if (from && to) {
							if (!/^[0-9]{12,16}|start$/.test(from)) continue; // ts or start
							if (!/^[0-9]{12,16}|end$/.test(to)) continue; // ts or end
							from = isNaN(from) ? 0 : Number(from);
							to = isNaN(to) ? 999999999999999999999 : Number(to);
							if (Number(dbTimestamp) < from || Number(dbTimestamp) > to) continue;
						}
					}
					
					let row;
					try {
						row = data.find((row) => row.name_unique === file);
						if (row && row.completed) {
							console.log('...Skipping completed migration file [' + file + ']');
							continue;
						}
					} catch (error) {}

					// do migrate and update table
					try {
						await db.raw(fdUp);

						if (row) await db('public.migrate').update({ completed: new Date(), data: JSON.stringify({ action: 'up', sql: fdUp, meta: fdMeta }) }).where({ name_unique: file });
						else await db('migrate').insert({ completed: new Date(), name_unique: file, data: JSON.stringify({ action: 'up', sql: fdUp, meta: fdMeta })});
						
						console.log('...Completed UP of migration file [' + file + ']');
					} catch (error) {
						console.log('Error with message: ' + error.message);
						console.log('...Reverting UP of migration file [' + file + ']');
						await db.raw(fdDown);
					}
				}
			}).catch(() => { });

			db.destroy();
		}

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('COMPLETE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');
	}

	/**
	 * @public @method down
	 * @description Bring all prepared migrations down
	 * @param {String} migration The migration name to use e.g. testing, production
	 * @param {String} dbname The database name to check e.g. mydatabase
	 */
	static async down(migration, dbname, imBonkersYesNuts) {
		if (dbname && !databases.find((db) => db.database === dbname)) {
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('UKNOWN DATABASE ' + dbname);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
		}

		// get all prepared migrations
		let files = Migration._getFilesToMigration('./migration').reverse();

		if (!imBonkersYesNuts) {
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('DOWN MIGRATION!!! ARE YOU SURE?');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
			console.log('Are you sure you want to destory ' + (migration ? 'migration "' + migration + '" ' : '') + (dbname ? '"' + dbname + '" database.' : 'ALL databases.'));
			console.log('Choosing DOWN on database/s will revert them completely, ALL DATA WILL BE LOST!');
			console.log('');
			console.log('Add this code to the end of your down command to enable down for 10 sec.');
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('I_WANT_TO_DESTROY_DATABASES_' + Math.round((Date.now() / 1000) + 10));
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
			return;
		} else if (Number(imBonkersYesNuts.replace('I_WANT_TO_DESTROY_DATABASES_', '')) >= Math.round(Date.now() / 1000)) {
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('CODE ACCEPTED...');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
		} else {
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('CODE FAILED!');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');
			return;
		}

		for await (const database of databases) {
			if (dbname && dbname !== database.database) continue;

			// connect DB
			let db = Migration._connect(database);
			console.log('');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('DOWN on ' + database.database);
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('');

			// grab all migrations
			await db.select().from('public.migrate').then(async (data) => {
				for await (const file of files) {
					// check file not ran against db
					const fd = fs.readFileSync(file, 'utf8');
					const fdMeta = fd.split('-- @up')[0];
					const fdDown = fd.split('-- @up')[1].split('-- @down')[1];

					// check timestamp and database name
					let dbName, dbTimestamp, mgName;
					try {
						dbName = fdMeta.match("-- @database (.*)")[1];
						dbTimestamp = fdMeta.match("-- @timestamp (.*)")[1];
						mgName = fdMeta.match("-- @name (.*)")[1];
						if (!database.database) throw Error('Cannot resolve database name in file [' + file + ']');
						if (database.database !== dbName) continue;
						if (file.indexOf(dbTimestamp) < 0) throw Error('Timestamp missmatch between filename and file meta data [' + file + ']');
						if (!mgName) throw Error('Cannot migration name in file [' + file + ']');
					} catch (error) {
						if (error.message) console.log(error.message);
						throw error;
					}

					// migration search
					if (migration) {
						// check basic
						if (!dbname) {
							console.log('');
							console.log('Must use database name with specific migrations');
							console.log('');
							throw Error(); // only allow from or to with dbname
						}

						// only do single migration
						const migs = migration.split(':');
						let from = migs[0];
						let to = migs[1];

						// single
						if (from && !to) if (from !== dbTimestamp) continue;
						// single
						if (!from && to) if (to !== dbTimestamp) continue;
						// range
						if (from && to) {
							if (!/^[0-9]{12,16}|start$/.test(from)) continue; // ts or start
							if (!/^[0-9]{12,16}|end$/.test(to)) continue; // ts or end
							from = isNaN(from) ? 0 : Number(from);
							to = isNaN(to) ? 999999999999999999999 : Number(to);
							if (Number(dbTimestamp) < from || Number(dbTimestamp) > to) continue;
						}
					}
					
					// check if migration not complete already, ignore if is not
					let row = data.find((row) => row.name_unique === file);
					if (!row || !row.completed) {
						console.log('...Skipping ' + (!row ? 'pending' : 'uncompleted') + ' migration file [' + file + ']');
						continue;
					}

					// do migrate and update table
					try {
						await db.raw(fdDown);
						console.log('...Completed DOWN of migration file [' + file + ']');
						await db('public.migrate').update({ completed: null, data: JSON.stringify({ action: 'down', sql: fdDown, meta: fdMeta }) }).where({ name_unique: file });
					} catch (error) {
						if (error.message.indexOf('relation "public.migrate" does not exist') < 0) {
							console.log('Error with message: ' + error.message);
							console.log('NOTE: Cannot bring down migration, please handle manually for file [' + file + ']');
						} else {
							console.log('');
							console.log('All migrations removed!');
						}
					}
				}
			}).catch(() => {}).then(() => db.destroy() );
		}

		console.log('');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('COMPLETE');
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('');
	}

	/**
	 * @public @method _getFilesToPrepare
	 * @description Grab a list of files that need preparing
	 * @param {String} dir The files as a flat array
	 * @return {array} Flat array of file paths
	 */
	static _getFilesToPrepare(dir) {
		const paths = fs.readdirSync(dir);
		const files = paths.map((path) => (fs.lstatSync(dir + '/' + path).isFile() ? dir + '/' + path : Migration._getFilesToPrepare(dir + '/' + path)));
		return files.flat().filter((f) => f.indexOf('./migration/ignore/') !== 0);
	}

	/**
	 * @public @method _getFilesToMigration
	 * @description Grab a list of files to migrate
	 * @param {String} dir The files as a flat array
	 * @return {array} Flat array of file paths
	 */
	static _getFilesToMigration(dir) {
		const paths = fs.readdirSync(dir);
		return paths
			.map((path) => (fs.lstatSync(dir + '/' + path).isFile() ? dir + '/' + path : Migration._getFilesToPrepare(dir + '/' + path)))
			.flat()
			.filter((path) => /prepared-[0-9]{12,20}--[a-zA-Z0-9_-]+\.sql/.test(path));
	}
}

// expose class to self run on file run
if (!Migration[task]) {
	console.log('');
	console.log('UNKOWN ACTION, please use health, list, up or down with migrate tool.');
	console.log('');
} else if (databases) Migration[task](migration, dbname, imBonkersYesNuts);
