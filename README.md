<p align="center">
  <img width="250" height="250" src="cerberus-round-wob-500x500.png">
</p>

[CerberusMVC](https://cerberus-mvc.co.uk)

# INTRO

Now Support AWS, ExpressJS (with child processes) and Socket.IO

CerberusCLI is a globally installable CLI tool for working with [CerberusMVC](https://www.npmjs.com/package/cerberus-mvc), a node based MVC stack for serverless function as a service architectures.

The premise for the CLI tool is to offer a few simple tools for dealing with CerberusMVC such as initialising new projects and handling things like database migrations, compatible with the database visualisation tool [DBDuck](https://dbduck.net) for visualisation and DB design.

Want to know more, see more of CerberusMVC? We are all about MVP, we are happy to expand documentation, add in more support; let us know your thoughts... [Find me here](https://pa.ulsmith.net).

# DOCUMENTATION

Please visit [CerberusMVC](https://cerberus-mvc.co.uk) for details about the project and [CerberusMVC](https://cerberus-mvc.co.uk/documentation-cerberus-cli.html) for documentation.

# INSTALLATION

Installation on a linux system may or may not require sudo for global installation permissions of a node module

```
npm install -g cerberus-cli
```

# COMMANDS

**Version**
Shows version and install information

```bash
cerberus-cli -v
cerberus-cli --version
```

**Help**
Shows various information on commands and such

```bash
cerberus-cli -h
cerberus-cli --help
```

**Init**
Initialise a new CerberusMVC project

```bash
cerberus-cli init
```

**Migration**
Migrate a database in your CerberusMVC project

```bash
cerberus-cli migration [task] --argument value
```

# INITIALISE

The `cerberus-cli init` command performs a new project initialisation for CerberusMVC. Steps include:-

* Meta data collection, builds the project based on the answers.
* Structure setup, configures the folder structure required for CerberusMVC to function.
* Creates a project structure from a know template (AWS, Express or Socket.IO).
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

In addition to handling migrations, we also have a DB visualizer called [DBDuck](https://dbduck.net) which you can use to generate compatible database designs, showing you your DB as an interactive DB diagram. 

The migration tool may be run directly through cerberus-cli from the CLI or form the project root through NPM...

## Configuration

The migration tool requires three things to function fully. One is the configuration, this then nturally leads to the other, the locaiton of the migrations for this configruation. Finally there is the migration table in the database you want to manage, there has to be a table to contain what migrations have happened and what state they are at. This si set in the config file.

The config file consists of the details required to connect to the database, along with the migrations path where the migration files can be found, this is saved in, by default a file called migration.json.

You are free to rename this file to something else of your choosing, if you do, you will be required to pass in the --config ./path/name.json attribute on each run of the CLI tool, so the importer can find the config. The config works in tandom with the --server argument. Passing in a --server production argument will instruct the migration tool to look for a config called migration.production.json by default. Use of the --config argument overrides the --server attribute and renders it mute.

Both --config and --server offer you the ability to renamed and relocate your migration config, along with having different configs for different servers, such as a default (local), testing and production set of configs allowing you to perform migrations on your server environments with ease. Youare also free to have more than one database of different types in your config, making up your system API, managing them all with a single command.

migration.json
```json
[
	{
		"migrations": "./migration/cerberus",
		"table": "public.migration",
		"engine": "postgres",
		"host": "postgres12.docker.localhost",
		"port": 5431,
		"database": "cerberus",
		"user": "postgres",
		"password": "nlnW.........2DD"
	}
]
```

* migrations > the path to your migrations for htis DB, relative to the config file
* table > the database table to use for storing migration details (must have columns id, created, completed, name and data as detailed below in sql example)
* engine > the database engine as postgres, mysql (see knex js)
* host > the host connection string (url)
* port > the port the conenction is on
* database > the name of the database to control
* user > admin connection details to server with access to control database structure
* password > the password to go with the above user

## Tasks

The migration tool has the following tasks that can be performed

### health

`cerberus-cli migration health`

Perform health check on databases in config

**Argument** (optional) --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json

**Argument** (optional) --config/-c some/file.json > Set a the file to migration config as a full path to file or relative

### list

`cerberus-cli migration list`

Check the migration table and also the migration files to see whats what, whats been run.

**Argument** (optional) --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json

**Argument** (optional) --config/-c some/file.json > Set a the file to migration config as a full path to file or relative

**Argument** (optional) --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

### prepare

`cerberus-cli migration prepare`

Prepare any migration files ready for running them (you have to prepare a migration before you run it, to ensure its good)

**Argument** (optional) --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json

**Argument** (optional) --config/-c some/file.json > Set a the file to migration config as a full path to file or relative

**Argument** (optional) --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

### parse

`cerberus-cli migration parse`

Parse a specific SQL file, this requires the file argument to be used to specify the file to process; you can use this to import data to a new database.

**Argument** (optional) --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json

**Argument** (optional) --config/-c some/file.json > Set a the file to migration config as a full path to file or relative

**Argument** (optional) --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

**Argument** (required) --file/-f some/file.sql > The SQL file you want to parse and run

### up

Uses timestamps appended to filename when prepared (and added to migration too as a comment). These timestamps can be used to do selective migrations

`cerberus-cli migration up`

Bring database/s up to current prepared migrations associated with them. This task has another optional argument --migration which when set, will perform an up on either one, or a range of migrations.
Adding a timestamp value to the argument or a range of timestamps will instruct the up task to perform only these migrates. Colon is used to dictate a range as 'start:timestamp', 'timestamp:timestamp' or 'timestamp:end' to dictate start to timestamp, timestamp to timestamp or timestamp to end. Any processed migrations will be skipped.

**Argument** (optional) --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json

**Argument** (optional) --config/-c some/file.json > Set a the file to migration config as a full path to file or relative

**Argument** (optional) --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

**Argument** (optional) --migration/-m 123456789:123456799 > Parse only this range of migrations. Use 'start' or 'end' keywords to dictate the start or end of the prepared migrations.

### down

Uses timestamps appended to filename when prepared (and added to migration too as a comment). These timestamps can be used to do selective migrations

`cerberus-cli migration down`

Bring database/s down to current prepared migrations associated with them. This task has another optional argument --migration which when set, will perform a down on either one, or a range of migrations.
Adding a timestamp value to the argument or a range of timestamps will instruct the down task to drop only these migrates. Colon is used to dictate a range as ':timestamp', 'timestamp:timestamp' or 'timestamp:' to dictate start to timestamp, timestamp to timestamp or timestamp to end. Any processed migrations will be skipped. All down migrations happen in reverse. So a down with no timestamp/s will bring down migrations from end to start. A range of timestamps will be brought down from last to first. All migrations are removed in reverse order.

**Argument** (optional) --server/-s production > Set a server extension on the migration file e.g. migration.production.json in the current working directory, default is no server e.g. migration.json

**Argument** (optional) --config/-c some/file.json > Set a the file to migration config as a full path to file or relative

**Argument** (optional) --database/-d yourdb > You may have more than one DB in your server stack, this picks just that db

**Argument** (optional) --migration/-m 123456789:123456799 > Parse only this range of migrations. Use 'start' or 'end' keywords to dictate the start or end of the prepared migrations.

## Migration Files

Migration files are written in pure SQL. This has many benefits, such as cut and paste ability from workbench to migraiton file, as well as clear understanding of what is happening with the full power of the SQL raw language. These migration files are commented to allow the migration tool to do several things, like verfiy the migration is for the right database (checking it against the config).

The migrations are found by looking at the config for hte loction of the migration stack for that specific database. the comments also provide information to the migraiton tool to tell it hwne things should happen, in what order. Other comments in the migration file allow the migration file to be pasted directly into [DBDuck](https://dbduck.net) to visualize your database as a diagram. Whilst there is no standard (apart from thecomments) required to work the SQL, it is recommended you use transactions to prevent any issues with broken migrations messing your dtaabase structure. Any failed migration will try to run the drop portion if it fails, so its important to always check before removing in a down section.

The migrations are set out as... meta data, up, down, int eh follwoing way (as postrgres example)

Meta data at the top for the migration tool and dbduck (timestamp will be prepended on preparing the file automatically)...
The '@up' dictates where your up portion goes...
The '@down' dictates where your down portion goes...
In this example we create a single table, some types and also set up some permissions for a user, the down clears up all this creation.

!IMPORTANT, you are required to have a migration table in your database to manage migrations. Ensure the name of this table matches the name in the config (table). Your first migration file should contain the migration table in it with it, using the columns stipulated in the example below as a minimum.

initial-setup.sql
```sql
-- @engine postgres
-- @database cerberus
-- @name initial-setup
-- @author Paul Smith
-- @copywrite cerberus.net
-- @date 2020-07-06
-- @copywrite cerberus.net
-- @license no-license

-- @editor_autosave false
-- @editor_width 660

-- @workspace_width 5000
-- @workspace_height 5000
-- @workspace_scale 1

-- @minimap_position bottom right
-- @minimap_scale 0.046875

-- @up

BEGIN;

CREATE SCHEMA IF NOT EXISTS "public";
CREATE SCHEMA IF NOT EXISTS "log";
CREATE SCHEMA IF NOT EXISTS "identity";
CREATE SCHEMA IF NOT EXISTS "design";

CREATE OR REPLACE FUNCTION updated_current_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

create extension if not exists "uuid-ossp";

CREATE TYPE "public"."communication_type" AS ENUM (
  'email',
  'phone',
  'twitter',
  'facebook'
);

CREATE TYPE "public"."subscription_type" AS ENUM (
  'custom',
  'full',
  'high',
  'medium',
  'low',
  'none'
);

-- @table public.migrate {"x":2546,"y":102,"w":200,"h":200,"accentColor":"#222","textColor":"#fff"}
CREATE TABLE "public"."migration" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "completed" timestamp,
  "name_unique" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id")
);

-- READ

-- roles for db
CREATE ROLE "cerberus_read";

-- grant access to db
GRANT CONNECT ON DATABASE "cerberus" TO "cerberus_read";

-- grant usage access to schemas
GRANT USAGE ON SCHEMA "public" TO "cerberus_read";

-- grant select access to existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO "cerberus_read";

-- grant select access to all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO "cerberus_read";

-- grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA "public" TO "cerberus_read";

-- grant usage on sequences to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE ON SEQUENCES TO "cerberus_read";

-- grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "public" TO "cerberus_read";

-- grant execute on function to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "cerberus_read";

-- grant usage on types
GRANT USAGE ON TYPE "public"."communication_type" TO "cerberus_read";
GRANT USAGE ON TYPE "public"."subscription_type" TO "cerberus_read";

-- grant execute on types to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE ON TYPES TO "cerberus_read";

-- READ WRITE

-- roles for db
CREATE ROLE "cerberus_read_write";

-- grant access to db
GRANT CONNECT ON DATABASE "cerberus" TO "cerberus_read_write";

-- grant read write access to schemas
GRANT USAGE, CREATE ON SCHEMA "public" TO "cerberus_read_write";

-- grant read write access to existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO "cerberus_read_write";

-- grant read write access to all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "cerberus_read_write";

-- grant read write access to sequence for serials and new create of sequences on existing
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public" TO "cerberus_read_write";

-- grant read write access to sequence for serials and new create of sequences on future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE, SELECT ON SEQUENCES TO "cerberus_read_write";

-- grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "public" TO "cerberus_read_write";

-- grant execute on function to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "cerberus_read_write";

-- grant usage on types
GRANT USAGE ON TYPE "public"."communication_type" TO "cerberus_read_write";
GRANT USAGE ON TYPE "public"."subscription_type" TO "cerberus_read_write";

-- grant execute on types to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE ON TYPES TO "cerberus_read_write";

-- USER

-- create a new users for db
CREATE USER "cerberus_api" WITH PASSWORD 'fjlf78............eh';

-- grant user access
GRANT "cerberus_read_write" TO "cerberus_api";

COMMIT;

-- @down

BEGIN;

-- USER

-- drop new users for db
DROP USER "cerberus_api";

-- READ

-- revoke read
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "public" FROM "cerberus_read";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" FROM "cerberus_read";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" FROM "cerberus_read";
REVOKE ALL PRIVILEGES ON TYPE "public"."communication_type" FROM "cerberus_read";
REVOKE ALL PRIVILEGES ON TYPE "public"."subscription_type" FROM "cerberus_read";

-- revoke future read
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON TABLES FROM "cerberus_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "cerberus_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "cerberus_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"  REVOKE ALL PRIVILEGES ON TYPES FROM "cerberus_read";

-- revoke scheme read
REVOKE ALL PRIVILEGES ON SCHEMA "public" FROM "cerberus_read";

-- revoke db read
REVOKE ALL PRIVILEGES ON DATABASE "cerberus" FROM "cerberus_read";

-- drop read
DROP ROLE "cerberus_read";

-- READ WRITE

-- revoke read write
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "public" FROM "cerberus_read_write";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" FROM "cerberus_read_write";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" FROM "cerberus_read_write";
REVOKE ALL PRIVILEGES ON TYPE "public"."communication_type" FROM "cerberus_read_write";
REVOKE ALL PRIVILEGES ON TYPE "public"."subscription_type" FROM "cerberus_read_write";

-- revoke future read write
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON TABLES FROM "cerberus_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "cerberus_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "cerberus_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"  REVOKE ALL PRIVILEGES ON TYPES FROM "cerberus_read_write";

REVOKE ALL PRIVILEGES ON SCHEMA "public" FROM "cerberus_read_write";

-- grant read write db
REVOKE ALL PRIVILEGES ON DATABASE "cerberus" FROM "cerberus_read_write";

-- drop read write
DROP ROLE "cerberus_read_write";

-- TABLES

DROP TABLE IF EXISTS "public"."migrate";

DROP TYPE IF EXISTS "public"."communication_type";
DROP TYPE IF EXISTS "public"."subscription_type";

COMMIT;
```