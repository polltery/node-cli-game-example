const prompt = require('prompt');
const config = require('./config.js');

var user = require('./user.js');

var player = require('./lib/player.js');
const monsters = require('./lib/monsters.js');
const bosses = require('./lib/bosses.js');
const specials = require('./lib/specials.js');
const friends = require('./lib/friends.js');

var mapEngine = require('./map-engine.js');

// Map properties
var map = mapEngine.map;

// Setup intial settings, player and map
var totalPlayers = config.totalPlayers;

var gameEngine = {};

gameEngine.setupGame = function () {
    //debug.show2dArrayContents(map);
    prompt.get({
        description: "Number of players",
        type: 'integer',
        message: 'Only 1 player is allowed to play',
        default: 1,
        required: true,
        conform: val => val === 1
    }, function (err, result) {
        totalPlayers = parseInt(result.question);
        if (totalPlayers !== 1) {
            console.log('Sorry, ' + totalPlayers + ' players are not supported yet');
        } else {
            setupMapMatrix()
        }
    });
}

function setupMapMatrix (){ 
    prompt.get({
        description : `Size of Map default is 4x4`,
        type : 'integer',
        message : 'Minimum: 4, Maximum: 99',
        default : 4,
        required : true,
        conform: val => val <= 99 && val >= 4
    },function (err, result) {
        let value = parseInt(result.question, 10);
        config.map_height = value;
        config.map_width = value;

        mapEngine.init();
        map = mapEngine.map;

        map[0][0] = {
            aquiredBy : player,
            type : "player",
            explored : true
        };

        mapEngine.createMapFromArray(monsters.concat(bosses,specials,friends));

        return gameEngine.startGame(true);
    });
}


gameEngine.startGame = function(isNextTurn,  playerObj, mapEngineObj, gameEngineObj){
    
    console.log(playerObj);
   
    if(playerObj != undefined){
        player = playerObj;
        mapEngine = mapEngineObj;
    }
    
    // debug.show2dArrayContents(map);
    console.log('TURN : ' + (isNextTurn ? ++player.turn : player.turn));
    mapEngine.displayMap(map);
    mapEngine.displayPosition(player);
    mapEngine.displayMovementOptions(mapEngine.getMovementOptions(player),player);
    user.getUserMovementChoice(gameEngine, mapEngine, player);
}

gameEngine.endGame = function(){
    console.log('Quittng game..'.red);
    process.exit();
}

module.exports = gameEngine;
