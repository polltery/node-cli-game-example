/* jshint esversion: 6*/
// Load the dev dependencies
const _ = require('lodash');
const prompt = require('prompt');

// Get essential data
const utils = require('./utils.js');

const gameEngine = require('./game-engine.js');

// Start prompt
prompt.start();

utils.assignTypesToCards();

// Entry point
gameEngine.setupGame();