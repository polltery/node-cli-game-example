var colors = require('colors');
var prompt = require('prompt');
var _ = require('lodash');
var spinner = require('cli-spinner').Spinner;

var loading = new spinner('Fighting...') // loading animation for fights module

var battleEngine = {}; // battles helper

battleEngine.initateBattle = function(home,away,callback){ // getting player and enemy stats
    var totalPower = getTotalPower(home); // total player stats sum
    prompt.get({ // query if player ready for fight
        description : colors.bold(home.name)+colors.dim('(POWER: '+totalPower+')')+'is about to fight '+colors.bold(away.name)+colors.dim('(POWER: '+away.power+')')+'\n type "go" when ready..',
        type : 'string',
        pattern : /go/,
        message : 'enter "go" when ready',
        default : 'go',
        required : false
    },function(err,result){ // getting battle results
        loading.start(); // starts battle animation in console
        setTimeout(function(){ // just decorative timeout to more realistic player experience by battle
            loading.stop(); // stops battle animation
            var rn = _.random(0,totalPower+away.power); // random int to determine the winner from zero to total sum of player and enemy power 
            var winner; // variable containes data about winner
            if(rn <= totalPower){ // check if player power is less when enemy attack
                winner = home; // sets player to winner
                home.resolve = true; // win flag
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

battleEngine.initiateBossBattle = function(player,boss,callback){ // getting player and boss stats
    console.log(colors.bold('You are about to fight a boss, boss fights are best of 3, and if you lose,')+colors.bold.red('game over!'));
    var totalPower = getTotalPower(player);
    prompt.get({ // query if player ready for fight
        description : 'Are you ready?',
        type : 'string',
        default : 'YES',
        required : false
    },function(err,result){
        var roundsLost = 0; // counter for lost rounds
        var roundsWon = 0; // counter for won's
        var round = 1; // current round variable, setted by 1
        console.log(colors.bold.yellow('Round '+round+' out of 3'));
        loading.start();
        setTimeout(function(){ // starts fight
            loading.stop();
            var rn = _.random(0,totalPower+boss.power);
            if(rn <= totalPower){ // is player won roud?
                roundsWon++; 
                console.log(colors.bold(player.name)+' wins this round!');
            }else{
                roundsLost++;
                console.log(colors.bold(boss.name)+' wins this round!');
            }
            round++; //change round to next
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
                if(roundsWon === 2){ // checks if player won previous fight
                    console.log(colors.bold(player.name)+' has defeated '+colors.bold(boss.name));
                    callback(boss.reward);
                }else if(roundsLost === 2){ // checks if player lost previous fight
                    console.log(colors.bold(boss.name)+' has defeated '+colors.bold(player.name));
                    callback();
                }else{
                    round++; // change round to final
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

function getTotalPower(player){ // returns total party power
    var totalPower = player.power;
    if(player.party.length > 0){
        for(var i = 0; i < player.party.length; i++){ // cycle for every party member
            totalPower += player.party[i].power; // entire party power
        }
    }
    return totalPower;
}

module.exports = battleEngine;