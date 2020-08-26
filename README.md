# INTRO

CerberusCLI is a globally installable CLI tool for working with [https://www.npmjs.com/package/cerberus-mvc](CerberusMVC), a node based MVC stack for serverless function as a service architectures.

The premis for the CLI tool is to offer a few simple tools for dealing with CerberusMVC such as initialising new projects and handling things like database migrations, compatible with the database visualisation tool [https://dbduck.net](DBDuck) for visualisation and DB design.

# INSTALLATION

Installation on a linux system may or may not require sudo for global installation permissions of a node module

```
npm install -g cerberus-cli
```

# COMMANDS

**Version**
Shows various infomraiton on commands and such

```bash
cerberus-cli -v
cerberus-cli --version
```

**Help**
Shows various infomraiton on commands and such

```bash
cerberus-cli -h
cerberus-cli --help
```

**Init**
Initialise a new CerberusMVC project

```bash
cerberus-cli init
```

**Migrate**
Migrate a database in your CerberusMVC project

```bash
cerberus-cli migrate [task] --argument value
```

# INITIALISE

The `cerberus-cli init` command performs a new project initialisation for CerberusMVC. Steps include:-

* Meta data collection, builds the project based on the answers.
* Structure setup, configures the folder structure required for CerberusMVC to function.
* Creates a project structure from a know template (AWS only supported at present, others to follow).
* Configures a package.json file with required information for the node project.
* Configures a template.yaml file for AWS SAM (AWS architectures only).
* Configures a swagger.json file for local swagger docker container (requires docker/docker-compose).
* Configures a docker-compose.yaml file for local swagger docker container (requires docker/docker-compose).
* Generates a basic README.md file.
* Generates a basic RELEASE.md file.
* Performs any post initialisation executions such as npm install to setup node_modules and load cerberus-mvc and other dependancies.

Once created you will be infomred of the basic commands, which can also be found in the package.json scripts section, as well as this documentation

After project is created in the directory the command was run, `cd <name/folder-name>` to enter hte project.

The following commands are preconfigured, running these **locally from the project root***...

Start the server (AWS uses SAM, ensure you have AWS SAM installed for AWS projects!)
```
npm start
```

Start the server without loading any new images (AWS this skip image check on each access for speed increase)
```
npm run serve
```

Package up the stack for deployment. If providers need split functions and routing, this will happen at this time.
(AWS copies a full stack to each lambda, along with a single routing file for API gateway, with modules loading only what is required in each lambda)
```
npm run package
```

Deploy the packaged stack to the provider, if provider supports CLI push of stack
(AWS pushes the stack using cloud formation through CLI, requires configured AWS credentials)
```
npm run deploy
```

Start a local swagger docker container (requires docker/docker-compose) to talk to the running API
```
npm run swagger:up
```

Stop the local running swagger server
```
npm run swagger:down
```

# MIGRATION

The CerberusCLI comes with a migration suite, allowing you to manage your database/s from initial conception, through to updates as the database changes through development. All the usual features are there, from running migraiton scripts to make transactioned changes, up, down and migration to timestamp. The one big benefit of using the CerberusCLI migraiton tool is the ability to not just manage your dabatase udpates locally form the CLI, but to also run standalone scripts to preload your database with data, all maanged from native SQL! No interim langauges or models, design your DB and copy and paste to a migration.

In addition to handling migrations, we also have a DB visualizer called [https://dbduck.net](DBDuck) which you can use to generate compatible database designs, showing you your DB as an interactive DB diagram. 

The migration tool may be run directly through cerberus-cli from the CLI or form teh project root through NPM...

## health
* Task: health > Perform health check on databases in config
* Argument: --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json
* Argument: --file/-f some/file.json > Set a the file to migration config as a full path to file or relative

## list
* Task: list > Check the migration table and also the migration files to see whats what, whats been run.
* Argument: --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json
* Argument: --file/-f some/file.json > Set a the file to migration config as a full path to file or relative
* Argument: --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

## prepare
* Task: prepare > Prepare any migration files ready for running them (you have to prepare a migration before you run it, to ensure its good)
* Argument: --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json
* Argument: --file/-f some/file.json > Set a the file to migration config as a full path to file or relative
* Argument: --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

TBC...

place a script inside package.js "migrate": "node migration/migrate.mjs" 
place a script inside package.js "migrate:testing": "SERVER=testing node migration/migrate.mjs" 
place a script inside package.js "migrate:staging": "SERVER=staging node migration/migrate.mjs" 
place a script inside package.js "migrate:production": "SERVER=production node migration/migrate.mjs" 

NOTE: add :testing to run migrate.testing.json e.g. npm run migrate:testing -- health

@command npm run migrate -- prepare
@detail prepare a migrate file for migration (any folder inside migration folder, even the migration folder)

@command npm run migrate -- health
@detail run a health check on all databases

@command npm run migrate -- health db_name
@detail run a health check on specific database

@command npm run migrate -- list
@detail list all migrations on all databases

@command npm run migrate -- list db_name
@detail list all migrations on specific database

@command npm run migrate -- parse dbname filepath
@detail parse a specific file without tracking

@command npm run migrate -- up
@detail migrate all databases to latest migrations

@command npm run migrate -- down
@detail revert all migrations on all databases... this is very very dangerous and requires a code

@command npm run migrate -- up db_name
@detail migrate database to latest version

@command npm run migrate -- down db_name
@detail revert all migrations on database... this is very very dangerous and requires a code

@command npm run migrate -- up db_name 1593443102301
@detail migrate specific migration against specific database (safer, only runs against specific database) 

@command npm run migrate -- down db_name 1593443102301
@detail revert specific migration against specific database (safer, only runs against specific database, no code required) this is very very dangerous and requires a code

@command npm run migrate -- up db_name start:1593443102301
@detail migrate range starting at start or timestamp and ending at end or timestamp against specific database (safer, only runs against specific database) 

@command npm run migrate -- down db_name 1593443102301:end
@detail revert range starting at start or timestamp and ending at end or timestamp against specific database (safer, only runs against specific database, no code required) this is very very dangerous and requires a code