/* jshint esversion: 6*/
// Load the dev dependencies
const _ = require('lodash');
const prompt = require('prompt');
const colors = require('colors');

// Get essential data
const monsters = require('./lib/monsters.js');
const bosses = require('./lib/bosses.js');
const specials = require('./lib/specials.js');
const friends = require('./lib/friends.js');
const debug = require('./debug.js');
const mapEngine = require('./map-engine.js');
const config = require('./config.js');
const battleEngine = require('./battle-engine.js');
const player = require('./lib/player.js');
const utils = require('./utils.js');

// Map properties
var map = mapEngine.map;

// Setup intial settings, player and map
var totalPlayers = config.totalPlayers;
utils.assignTypesToCards();


var movementSchema = {
    description : 'Please enter a movement option',
    type : 'string',
    pattern : new RegExp("^(" + mapEngine.getMovementOptions(player).join("|") + ")$", "i"),
    message : 'Please choose an appropriate movement option',
    require : true,
    before: val => val.toUpperCase()
}

// Start prompt
prompt.start();

// Entry point
setupGame();

// setup map matrix size
function setupMapMatrix(){ 
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

        return startGame(true);
    });
}

// Setup, Start and end game
function setupGame(){ 
    //debug.show2dArrayContents(map);
    prompt.get({
        description : "Number of players",
        type : 'integer',
        message : 'Only 1 player is allowed to play',
        default : 1,
        required : true,
        conform: val => val === 1
    },function (err, result) {
        totalPlayers = parseInt(result.question);
        if(totalPlayers !== 1){
            console.log('Sorry, '+totalPlayers+' players are not supported yet');
        }else{
            setupMapMatrix()
        }
    });
}

function startGame(isNextTurn){
    // debug.show2dArrayContents(map);
    console.log('TURN : ' + (isNextTurn ? ++player.turn : player.turn));
    mapEngine.displayMap(map);
    mapEngine.displayPosition(player);
    mapEngine.displayMovementOptions(mapEngine.getMovementOptions(player),player);
    getUserMovementChoice();
}

function getUserMovementChoice() {
    console.log('Please choose one option from the above'.dim);
    prompt.get(movementSchema,(err, result) => turn(err, result));
}

function turn(err,result){
    if (!err) {
        var choice = result.question;
        var choiceIsValid = validateUserChoice(choice);
        if (choiceIsValid) {
            play(choice);
        } else {
            getUserMovementChoice();
        }
    } else {
        console.log(err);
    }
}

function validateUserChoice(choice) {
    return (choice && choice !== '' && (choice === 'N' || choice === 'W' || choice === 'E' || choice === 'S' || choice === 'NE' || choice === 'NW' || choice === 'SE' || choice === 'SW'));
}

function play(choice) {
    console.log('You choose '+choice+' ('+mapEngine.getFullDirection(choice)+')');
    var nextTile = mapEngine.getObjectFromCurrentPosition(player.x,player.y,choice);
    switch(nextTile.type){
        case 'blocked' :
            console.log('The option selected is blocked, you can\'t move');
            startGame(false);
            break;
        case 'safe' :
            mapEngine.movePlayerTowards(choice);
            updateTile(nextTile);
            encounter(nextTile);
            break;
        case 'special' :
            switch(nextTile.aquiredBy.effect){
                case 'block' :
                    nextTile.explored = true;
                    nextTile.type = 'blocked';
                    console.log('scroch tile blocks your path');
                    break;
            }
            startGame(true);
            break;
        case 'monster' :
            mapEngine.movePlayerTowards(choice);
            updateTile(nextTile);
            if(player.freePass === 0){
                encounter(nextTile.aquiredBy);
            }else{
                console.log('You used your free pass to skip the monster ' + colors.bold(nextTile.aquiredBy.name) + '. Free passes remaining ' + (--player.freePass));
                mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
                startGame(true);
            }
            break;
        case 'boss' :
        case 'friend' :
            mapEngine.movePlayerTowards(choice);
            if(nextTile.explored === false){
                updateTile(nextTile);
                encounter(nextTile.aquiredBy);
            }else{
                startGame(true);
            }
            break;
    }
}

function endGame(){
    console.log('Quittng game..'.red);
    process.exit();
}

/*
  ______ _    _ _   _  _____ _______ _____ ____  _   _  _____ 
 |  ____| |  | | \ | |/ ____|__   __|_   _/ __ \| \ | |/ ____|
 | |__  | |  | |  \| | |       | |    | || |  | |  \| | (___  
 |  __| | |  | | . ` | |       | |    | || |  | | . ` |\___ \ 
 | |    | |__| | |\  | |____   | |   _| || |__| | |\  |____) |
 |_|     \____/|_| \_|\_____|  |_|  |_____\____/|_| \_|_____/ 
*/

function postBattleEncounter(){
    if(player.end === false){
        if(player.resolve === false){
            console.log('TURN : '+ (++player.turn));
            console.log('You conflict with '+colors.bold(player.conflict.enemy.name)+' is still not resolved');
            battleEngine.initateBattle(player,player.conflict.enemy,postBattleEncounter);
        }else{
            mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
            startGame(true);
        }
    }else{
        endGame();
    }
}

function postBossEncounter(reward){
    if(reward !== undefined){
        switch(reward.depth){
            case 0:
                switch(reward.assignment){
                    case 'add' :
                        player[reward.property] = reward.value;
                        break;
                }
                break;
            case 1:
                var properties = reward.property.match(/[a-zA-Z]+/g);
                switch(reward.assignment){
                    case 'update' :
                        player[properties[0]][properties[1]] = reward.value; 
                        break;
                }
                break;
        }
        console.log(reward.description);
        prompt.get({
            description : 'Continue?',
            type : 'boolean',
            default : true,
            require : false
        }, function(err,result){
            if(player.end === false){
                mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
                startGame(true);
            }else{
                endGame();
            }
        });
    }else{
        endGame();
    }
}

function updateTile(tile){
    tile.explored = true;
}

function encounter(object){
    console.log('You have encounterd a '+colors.bold(object.type)+' tile containing '+colors.bold(object.name));
    switch(object.type){
        case 'monster' : 
            battleEngine.initateBattle(player,object,postBattleEncounter);
            break;
        case 'special' : 
            // do action based on special name
            break;
        case 'boss' :
            // do action based on boss name
            battleEngine.initiateBossBattle(player,object,postBossEncounter);
            break;
        case 'friend' :
            // do action based on friend name
            if(object.name === 'Cirilla Fiona Elen Riannon'){
                player.objectives.ciri = true;
                if(player.objectives.wildHunt === true){
                    endGame();
                }else{
                    // prompt
                }
            }else{
                // add friend to party
            }
            break;
        case 'safe' :
            // Simply move
            postBattleEncounter();
            break;
    }
}
