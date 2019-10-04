/* jshint esversion: 6*/
const _ = require('lodash');
const kcomb = require('foreach-combination');
const colors = require('colors');
const player = require('./lib/player.js');

const config = require('./config.js');
const utils = require('./utils.js');

var map_width = config.map_width;
var map_height = config.map_height;
var map = utils.create2dArray(map_width,map_height,0);

var mapEngine = {};

mapEngine.displayMap = function(map){
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
};

mapEngine.createMapFromArray = function(type){
    var samples = _.sampleSize(type, type.length);
    for(var i = 0; i < map_width; i++){
        for(var j = 0; j < map_height; j++){
            if(!(i === 0 && j === 0)){
            var sample = samples.pop();
                map[i][j] = {
                    aquiredBy : sample,
                    type : sample === undefined ? 'safe' : sample.type,
                    explored : false
                };
            }
        }
    }
};


mapEngine.getFullDirection = function(direction){
    if (direction && direction !== '') {
        if(direction.length === 1){
            switch(direction){
                case 'N' : return 'North';
                case 'S' : return 'South';
                case 'W' : return 'West';
                case 'E' : return 'East';
            }
        }else{
            return this.getFullDirection(direction.substring(0,1))+'-'+this.getFullDirection(direction.substring(1,2));
        }
    }
};

mapEngine.displayPosition = function(player){
    console.log('you are at '+player.x+','+player.y);
};

mapEngine.getMovementOptions = function(player){
    var options = [];
    if(player.y !== 0){
        options.push('N');
    }
    if(player.y !== map_height-1){
        options.push('S');
    }
    if(player.x !== 0){
        options.push('W');
    }
    if(player.x !== map_width-1){
        options.push('E');
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
};

mapEngine.obtainMovementOptionInfo = function(position){
    if(position.explored === false){
        return 'unknown';
    }else{
        return position.type;
    }
};

mapEngine.displayMovementOptions = function(movementOptions, player){
    console.log('Here are your movement options..'.bold);
    var movementOptionInfos = [];
    for(var i = 0; i < movementOptions.length; i++){
        switch(movementOptions[i]){
            case 'N' : 
            movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x][player.y-1]));
            break;
            case 'S' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x][player.y+1]));
                break;
            case 'E' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x+1][player.y]));
                break;
            case 'W' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x-1][player.y]));
                break;
            case 'NE' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x+1][player.y-1]));
                break;
            case 'NW' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x-1][player.y-1]));
                break;
            case 'SE' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x+1][player.y+1]));
                break;
            case 'SW' :
                movementOptionInfos.push(this.obtainMovementOptionInfo(map[player.x-1][player.y+1]));
                break;
        }
    }
    for(var i = 0; i < movementOptions.length; i++){
        console.log(colors.cyan(movementOptions[i]) + colors.dim('('+this.getFullDirection(movementOptions[i])+')')+' : ' + colors.cyan(movementOptionInfos[i]));
    }
};

mapEngine.getObjectFromCurrentPosition = function(x,y,direction){
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
            return map[x-1][y+1];
        default:
            return map[x][y];
    }
};

mapEngine.movePlayerTowards = function(direction){
    switch(direction){
        case 'S' : 
            player.prev_x = player.x;
            player.prev_y = player.y++;
            break;
        case 'N' : 
            player.prev_x = player.x;
            player.prev_y = player.y--;
            break;
        case 'E' :
            player.prev_x = player.x++;
            player.prev_y = player.y;
            break;
        case 'W' :
            player.prev_x = player.x--;
            player.prev_y = player.y;
            break;
        case 'NE':
            player.prev_x = player.x++;
            player.prev_y = player.y--;
            break;
        case 'NW':
            player.prev_x = player.x--;
            player.prev_y = player.y--;
            break;
        case 'SE':
            player.prev_x = player.x++;
            player.prev_y = player.y++;
            break;
        case 'SW':
            player.prev_x = player.x--;
            player.prev_y = player.y++;
            break;
    }
};

mapEngine.updateNextAndPreviousMapTiles = function(x,y,prev_x,prev_y,nextType,nextAquiredBy,prevType,prevAquiredBy){
    map[x][y].type = nextType;
    map[x][y].aquiredBy = nextAquiredBy;
    map[prev_x][prev_y].type = prevType;
    map[prev_x][prev_y].aquiredBy = prevAquiredBy;
};

mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement = function(player,prevType,prevAquiredBy){
    this.updateNextAndPreviousMapTiles(player.x,player.y,player.prev_x,player.prev_y,'player',player,prevType,prevAquiredBy);
};

mapEngine.map = map;

module.exports = mapEngine;
