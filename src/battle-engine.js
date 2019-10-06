var _ = require('lodash');
var colors = require('colors');
var prompt = require('prompt');
var spinner = require('cli-spinner').Spinner;

var gameEngine = require('./game-engine.js');
var mapEngine = require('./map-engine.js');

var player = require('./lib/player.js');

var loading = new spinner('Fighting...')

var battleEngine = {};

battleEngine.initateBattle = function(home,away,callback){
    var totalPower = getTotalPower(home);
    prompt.get({
        description : colors.bold(home.name)+colors.dim('(POWER: '+totalPower+')')+'is about to fight '+colors.bold(away.name)+colors.dim('(POWER: '+away.power+')')+'\n type "go" when ready..',
        type : 'string',
        pattern : /go/,
        message : 'enter "go" when ready',
        default : 'go',
        required : false
    },function(err,result){
        loading.start();
        setTimeout(function(){
            loading.stop();
            var rn = _.random(0,totalPower+away.power);
            var winner;
            if(rn <= totalPower){
                winner = home;
                home.resolve = true;
            }else{
                winner = away;
                home.resolve = false;
                home.conflict.enemy = away;
            }
            console.log('... and the winner is '+colors.bold(winner.name));
            setTimeout(callback,2000);
        },2000)
    });
}

battleEngine.initiateBossBattle = function(player,boss,callback){
    console.log(colors.bold('You are about to fight a boss, boss fights are best of 3, and if you lose,')+colors.bold.red('game over!'));
    var totalPower = getTotalPower(player);
    prompt.get({
        description : 'Are you ready?',
        type : 'string',
        default : 'YES',
        required : false
    },function(err,result){
        var roundsLost = 0;
        var roundsWon = 0;
        var round = 1;
        console.log(colors.bold.yellow('Round '+round+' out of 3'));
        loading.start();
        setTimeout(function(){
            loading.stop();
            var rn = _.random(0,totalPower+boss.power);
            if(rn <= totalPower){
                roundsWon++;
                console.log(colors.bold(player.name)+' wins this round!');
            }else{
                roundsLost++;
                console.log(colors.bold(boss.name)+' wins this round!');
            }
            round++;
            console.log(colors.bold.yellow('Round '+round+' out of 3'));
            loading.start();
            setTimeout(function(){
                loading.stop();
                var rn = _.random(0,totalPower+boss.power);
                if(rn <= totalPower){
                    roundsWon++;
                    console.log(colors.bold(player.name)+' wins this round!');
                }else{
                    roundsLost++;
                    console.log(colors.bold(boss.name)+' wins this round!');
                }
                if(roundsWon === 2){
                    console.log(colors.bold(player.name)+' has defeated '+colors.bold(boss.name));
                    callback(boss.reward);
                }else if(roundsLost === 2){
                    console.log(colors.bold(boss.name)+' has defeated '+colors.bold(player.name));
                    callback();
                }else{
                    round++;
                    console.log(colors.bold.yellow('Round '+round+' out of 3'));
                    loading.start();
                    setTimeout(function(){
                        loading.stop();
                        var rn = _.random(0,totalPower+boss.power);
                        if(rn <= totalPower){
                            roundsWon++;
                            console.log(colors.bold(player.name)+' wins this round!');
                        }else{
                            roundsLost++;
                            console.log(colors.bold(boss.name)+' wins this round!');
                        }
                        if(roundsWon === 2){
                            console.log(colors.bold(player.name)+' has defeated '+colors.bold(boss.name));
                            callback(boss.reward);
                        }else if(roundsLost === 2){
                            console.log(colors.bold(boss.name)+' has defeated '+colors.bold(player.name));
                            callback();
                        }else{
                            round++;
                        }
                    },2000);
                }
            },2000);
        },2000);

    });
}

battleEngine.postBattleEncounter = function(){
    if(player.end === false){
        if(player.resolve === false){
            console.log('TURN : '+ (++player.turn));
            console.log('You conflict with '+colors.bold(player.conflict.enemy.name)+' is still not resolved');
            battleEngine.initateBattle(player,player.conflict.enemy,battleEngine.postBattleEncounter);
        }else{
            mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
            gameEngine.startGame(true, player, mapEngine);
        }
    }else{
        gameEngine.endGame();
    }
}

battleEngine.postBossEncounter = function(reward){
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
                gameEngine.startGame(true,  player, mapEngine, gameEngine);
            }else{
                gameEngine.endGame();
            }
        });
    }else{
        gameEngine.endGame();
    }
}

battleEngine.updateTile = function(tile){
    tile.explored = true;
}

battleEngine.encounter = function (object, playerObj, mapEngineObjt, gameEngineObj){
    mapEngine = mapEngineObjt;
    //player = playerObj;
    gameEngine = gameEngineObj;
    console.log('You have encounterd a '+colors.bold(object.type)+' tile containing '+colors.bold(object.name));
    switch(object.type){
        case 'monster' : 
            battleEngine.initateBattle(player,object,battleEngine.postBattleEncounter);
            break;
        case 'special' : 
            // do action based on special name
            break;
        case 'boss' :
            // do action based on boss name
            battleEngine.initiateBossBattle(player,object,battleEngine.postBossEncounter);
            break;
        case 'friend' :
            // do action based on friend name
            if(object.name === 'Cirilla Fiona Elen Riannon'){
                player.objectives.ciri = true;
                if(player.objectives.wildHunt === true){
                    gameEngine.endGame();
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

function getTotalPower(player){
    var totalPower = player.power;
    if(player.party.length > 0){
        for(var i = 0; i < player.party.length; i++){
            totalPower += player.party[i].power;
        }
    }
    return totalPower;
}

module.exports = battleEngine;