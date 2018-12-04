// Load the dev dependencies
var _ = require('lodash');
var prompt = require('prompt');
var colors = require('colors');
var kcomb = require('foreach-combination');

// Get essential data
var monsters = require('./lib/monsters.js');
var bosses = require('./lib/bosses.js');
var specials = require('./lib/specials.js');
var friends = require('./lib/friends.js');
var debug = require('./debug.js');
var config = require('./config.js');
var battleEngine = require('./battle-engine.js');

// Add type because they are going to be merged in the map
for(var i = 0; i < monsters.length; i++){
    monsters[i].type = "monster";
}
for(var i = 0; i < bosses.length; i++){
    bosses[i].type = "boss";
}
for(var i = 0; i < specials.length; i++){
    specials[i].type = "special";
}
for(var i = 0; i < friends.length; i++){
    friends[i].type = "friend";
}

// Setup intial settings, player and map
var totalPlayers = config.totalPlayers;
var player = {
    name : 'Geralt of Rivia',
    power : 15,
    party : [], // If the player meets a friend unit then their details are pushed to this array
    prev_x : 0, // previous x of player
    prev_y : 0, // previous y of player
    x : 0, // Current x of player 
    y : 0, // Current y of player
    freePass : 0, // If 1 or more then the player is allowed to move to a tile without fighting
    resolve : true, // Is the player in a fight?
    conflict : {
        enemy : undefined // If the player is in a fight then who is the player fighting?
    },
    end : false, // has the game ended?
    turn : 0, // Counter for no. of turns player has played 
    objectives : {
        ciri : false, // has the player found the ciri tile?
        wildHunt : false // Has the player defeated wildHunt?
    }
};

// Map properties
var map_width = config.map_width;
var map_height = config.map_height;
var map = create2dArray(map_width,map_height,0);

// Start prompt
prompt.start();

// Entry point
setupGame();

// Setup, Start and end game
function setupGame(){
    map[0][0] = {
        aquiredBy : player,
        type : "player",
        explored : true
    };
    createMapFromArray(monsters.concat(bosses,specials,friends));
    //debug.show2dArrayContents(map);
    prompt.get({
        description : "Number of players",
        type : 'number',
        pattern : /1/,
        message : 'Only 1 player is allowed to play',
        default : 1,
        required : true
    },function (err, result) {
        totalPlayers = parseInt(result.question);
        if(totalPlayers !== 1){
            console.log('Sorry, '+totalPlayers+' players are not supported yet');
        }else{
            startGame();
        }
    });
}

function startGame(){
    //debug.show2dArrayContents(map);
    console.log('TURN : '+player.turn);
    displayMap(map);
    displayPosition(player);
    displayMovementOptions(getMovementOptions(player),player);
    console.log('Please choose one option from the above'.dim);
    prompt.get({
        description : 'Please enter a movement option',
        type : 'string',
        pattern : /^([NSEW]|[NS][EW])$/,
        message : 'Please choose an appropriate movement option',
        require : true
    },function(err,result){
        console.log('You choose '+result.question+' ('+getFullDirection(result.question)+')');
        var nextTile = getObjectFromCurrentPosition(player.x,player.y,result.question);
        switch(nextTile.type){
            case 'blocked' :
                console.log('The option selected is blocked, you can\'t move');
                startGame();
                break;
            case 'safe' :
                movePlayerTowards(result.question);
                player.turn++;
                startGame();
                break;
            case 'special' :
                switch(nextTile.aquiredBy.effect){
                    case 'block' :
                        nextTile.explored = true;
                        nextTile.type = 'blocked';
                        console.log('scroch tile blocks your path');
                        break;
                }
                player.turn++;
                startGame();
                break;
            case 'monster' :
                movePlayerTowards(result.question);
                var tile = nextTile;
                if(tile.explored === false){
                    updateTile(tile);
                    if(player.freePass === 0){
                        encounter(tile.aquiredBy);
                    }
                }else{
                    if(tile.type !== "safe" && player.freePass === 0){
                        encounter(tile.aquiredBy);
                    }else{
                        player.turn++;
                        startGame();
                    }
                }
                break;
            case 'boss' : 
            case 'friend' :
                movePlayerTowards(result.question);
                var tile = nextTile;
                if(tile.explored === false){
                    updateTile(tile);
                    encounter(tile.aquiredBy);
                }else{
                    player.turn++;
                    startGame();
                }
            break;
        }
    });
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
            player.turn++;
            console.log('TURN : '+player.turn);
            console.log('You conflict with '+colors.bold(player.conflict.enemy.name)+' is still not resolved');
            battleEngine.initateBattle(player,player.conflict.enemy,postBattleEncounter);
        }else{
            map[player.x][player.y].type = "player";
            map[player.x][player.y].aquiredBy = player;
            map[player.prev_x][player.prev_y].type = "safe";
            map[player.prev_x][player.prev_y].aquiredBy = undefined;
            player.turn++;
            startGame();
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
                map[player.x][player.y].type = "player";
                map[player.x][player.y].aquiredBy = player;
                map[player.prev_x][player.prev_y].type = "safe";
                map[player.prev_x][player.prev_y].aquiredBy = undefined;
                player.turn++;
                startGame();
            }else{
                endGame();
            }
        });
    }else{
        endGame();
    }
}

function movePlayerTowards(direction){
    if(direction.length === 1){
        switch(direction){
            case 'S' : 
                player.prev_y = player.y;
                player.y = player.y+1;
                break;
            case 'N' : 
                player.prev_y = player.y;
                player.y = player.y-1;
                break;
            case 'E' :
                player.prev_x = player.x;
                player.x = player.x+1;
                break;
            case 'S' :
                player.prev_x = player.x;
                player.x = player.x-1;
                break;
        }
    }else{
        movePlayerTowards(direction.substring(0,1));
        movePlayerTowards(direction.substring(1,2));
    }
}

function getObjectFromCurrentPosition(x,y,direction){
    switch(direction){
        case 'S' :
            return map[x][y+1];
        case 'N' :
            return map[x][y-1];
        case 'E' :
            return map[x+1][y];
        case 'W' :
            return map[x-1][y];
        case 'NE' :
            return map[x+1][y-1];
        case 'NW' :
            return map[x-1][y-1];
        case 'SE' : 
            return map[x+1][y+1];
        case 'SW' :
            return map[x-1][y-1];
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
        case 'safe' :
            // Simply move
    }
}

// Function for creating a 2d ARRAY ASSHOLES!
function create2dArray(numrows, numcols, initial){
   var arr = [];
   for (var i = 0; i < numrows; ++i){
      var columns = [];
      for (var j = 0; j < numcols; ++j){
         columns[j] = initial;
      }
      arr[i] = columns;
    }
    return arr;
}

function displayMovementOptions(movementOptions, player){
    console.log('Here are your movement options..'.bold);
    var movementOptionInfos = [];
    for(var i = 0; i < movementOptions.length; i++){
        switch(movementOptions[i]){
            case 'N' : 
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x][player.y-1]));
                break;
            case 'S' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x][player.y+1]));
                break;
            case 'E' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x+1][player.y]));
                break;
            case 'W' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x-1][player.y]));
                break;
            case 'NE' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x+1][player.y-1]));
                break;
            case 'NW' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x-1][player.y-1]));
                break;
            case 'SE' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x+1][player.y+1]));
                break;
            case 'SW' :
                movementOptionInfos.push(obtainMovementOptionInfo(map[player.x-1][player.y+1]));
                break;
        }
    }
    for(var i = 0; i < movementOptions.length; i++){
        console.log(colors.cyan(movementOptions[i]) + colors.dim('('+getFullDirection(movementOptions[i])+')')+' : ' + colors.cyan(movementOptionInfos[i]));
    }
}

function obtainMovementOptionInfo(position){
    if(position.explored === false){
        return 'unknown';
    }else{
        return position.type;
    }
}

function getMovementOptions(player){
    var options = [];
    if(player.y !== 0){
        options.push('N');
    }
    if(player.y !== map_height-1){
        options.push('S')
    }
    if(player.x !== 0){
        options.push('W');
    }
    if(player.x !== map_width-1){
        options.push('E')
    }
    kcomb(options,2,function(x,y){
        if((x === 'N' || x === 'S')){
            if((x === 'N' && y === 'S') || (x === 'S' && y === 'N')){
                // Do nothing.
            }else{
                options.push(x+y);
            }
        }
    });
    return options;
}

function displayPosition(player){
    console.log('you are at '+player.x+','+player.y);
}

function createMapFromArray(type){
    var samples = _.sampleSize(type, type.length);
    for(var i = 0; i < map_width; i++){
        for(var j = 0; j < map_height; j++){
            if(!(i === 0 && j === 0)){
            var sample = samples.pop();
                map[i][j] = {
                    aquiredBy : sample,
                    type : sample.type,
                    explored : false
                }
            }
        }
    }
};

function getFullDirection(direction){
    if(direction.length === 1){
        switch(direction){
            case 'N' : return 'North';
            case 'S' : return 'South';
            case 'W' : return 'West';
            case 'E' : return 'East';
        }
    }else{
        return getFullDirection(direction.substring(0,1))+'-'+getFullDirection(direction.substring(1,2));
    }
}

function displayMap(map){
    console.log('MAP VIEW'.bgWhite.black);
    for(var i = 0; i < map_width; i++){
        var row = '';
        for(var j = 0; j < map_height; j++){
            if(map[j][i].explored){
                switch(map[j][i].type){
                    case 'player' :
                        row += colors.cyan(' * ');
                        break;
                    case 'blocked' :
                        row += colors.gray(' * ');
                        break;
                    default :
                        row += ' * ';
                }
            }else{
                row += ' * '.red;
            }
        }
        console.log(row);
    }
}