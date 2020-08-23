# README

```
npm install -g cerberus-cli
```

# Migrations

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