const prompt = require('prompt');
const colors = require('colors');

const user = {}
var mapEngine = require('./map-engine.js');
//var gameEngine = require('./game-engine.js');
var player = require('./lib/player.js');
const battleEngine = require('./battle-engine.js');


// Map properties
//var map = mapEngine.map;

// Setup intial settings, player and map
//var totalPlayers = config.totalPlayers;

var movementSchema = {
    description : 'Please enter a movement option',
    type : 'string',
    pattern : new RegExp("^(" + mapEngine.getMovementOptions(player).join("|") + ")$", "i"),
    message : 'Please choose an appropriate movement option',
    require : true,
    before: val => val.toUpperCase()
}

user.getUserMovementChoice = function(gameEngineObj, mapEngineObj, playerObj) {
    gameEngine = gameEngineObj;
    mapEngine = mapEngineObj;
    player = playerObj;

    console.log('Please choose one option from the above'.dim);
    prompt.get(movementSchema,(err, result) => user.turn(err, result));
}

user.turn = function(err,result){
    if (!err) {
        var choice = result.question;
        var choiceIsValid = user.validateUserChoice(choice);
        if (choiceIsValid) {
            user.play(choice);
        } else {
            user.getUserMovementChoice();
        }
    } else {
        console.log(err);
    }
}

user.validateUserChoice = function(choice) {
    return (choice && choice !== '' && (choice === 'N' || choice === 'W' || choice === 'E' || choice === 'S' || choice === 'NE' || choice === 'NW' || choice === 'SE' || choice === 'SW'));
}

user.play = function(choice) {
    console.log('You choose '+choice+' ('+mapEngine.getFullDirection(choice)+')');
    var nextTile = mapEngine.getObjectFromCurrentPosition(player.x,player.y,choice);
    switch(nextTile.type){
        case 'blocked' :
            console.log('The option selected is blocked, you can\'t move');
            gameEngine.startGame(false);
            break;
        case 'safe' :
            mapEngine.movePlayerTowards(choice);
            battleEngine.updateTile(nextTile);
            battleEngine.encounter(nextTile.aquiredBy, player, mapEngine, gameEngine);
            break;
        case 'special' :
            switch(nextTile.aquiredBy.effect){
                case 'block' :
                    nextTile.explored = true;
                    nextTile.type = 'blocked';
                    console.log('scroch tile blocks your path');
                    break;
            }
            gameEngine.startGame(true);
            break;
        case 'monster' :
            mapEngine.movePlayerTowards(choice);
            battleEngine.updateTile(nextTile);
            if(player.freePass === 0){
               battleEngine.encounter(nextTile.aquiredBy, player, mapEngine, gameEngine);
            }else{
                console.log('You used your free pass to skip the monster ' + colors.bold(nextTile.aquiredBy.name) + '. Free passes remaining ' + (--player.freePass));
                mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
                gameEngine.startGame(true);
            }
            break;
        case 'boss' :
        case 'friend' :
            mapEngine.movePlayerTowards(choice);
            if(nextTile.explored === false){
                battleEngine.updateTile(nextTile);
                battleEngine.encounter(nextTile.aquiredBy, player, mapEngine, gameEngine);
            }else{
                gameEngine.startGame(true);
            }
            break;
    }
}

module.exports = user;