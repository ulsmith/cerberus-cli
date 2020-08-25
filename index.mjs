#!/usr/bin/env node

// npm install -g ./

import Help from './src/Help.mjs';
import Init from './src/Init.mjs';
import Tools from './src/Tools.mjs';
import Migration from './src/Migration.mjs';

const actions = {
	'-v': Tools,
	'--version': Tools,
	'-h': Help,
	'--help': Help,
	Init,
	Migration
};

// get arguments
const args = process.argv;
const action = (args[2] || 'help').toLowerCase().replace(/^\w/g, (m) => m[0].toUpperCase());

// run function
if (!actions[action]) console.log(`\nInvalid action '${action}', try 'cerberus-cli --help' for actions.\n`);
else actions[action].run(args, actions, action);