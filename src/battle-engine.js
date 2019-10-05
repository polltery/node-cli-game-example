var colors = require("colors");
var prompt = require("prompt");
var _ = require("lodash");
var spinner = require("cli-spinner").Spinner;

var loading = new spinner("Fighting...");

var battleEngine = {};

battleEngine.initateBattle = function (home, away, callback) {
  var totalPower = getTotalPower(home);

  prompt.get(
    {
      description: colors.bold(home.name) + colors.dim("(POWER: " + totalPower + ")") + "is about to fight " + colors.bold(away.name) + colors.dim("(POWER: " + away.power + ")") + '\n type "go" when ready..',
      type: "string",
      pattern: /go/,
      message: 'enter "go" when ready',
      default: "go",
      required: false
    },
    function (err, result) {
      loading.start();
      setTimeout(function () {
        loading.stop();
        var rn = _.random(0, totalPower + away.power);
        var winner;
        if (rn <= totalPower) {
          winner = home;
          home.resolve = true;

          console.log("... and the winner is " + colors.bold(winner.name));
        } else {
          winner = away;
          home.resolve = false;
          home.conflict.enemy = away;
          home.power -= away.power;

          console.log("... and the winner is " + colors.bold(winner.name) + "\n  Your power reduce to (" + colors.red(home.power) + ")");
          if (home.power <= 0) {
            console.log(`\n  ${colors.red("YOU LOST")}`);
            home.end = true;
          }
        }


        setTimeout(callback, 2000);
      }, 2000);
    }
  );
};

battleEngine.initiateBossBattle = function (player, boss, callback) {
  console.log(
    colors.bold(
      "You are about to fight a boss, boss fights are best of 3, and if you lose,"
    ) + colors.bold.red("game over!")
  );
  var totalPower = getTotalPower(player);
  prompt.get(
    {
      description: "Are you ready?",
      type: "string",
      default: "YES",
      required: false
    },
    function (err, result) {
      var roundsLost = 0;
      var roundsWon = 0;
      var round = 1;
      console.log(colors.bold.yellow("Round " + round + " out of 3"));
      loading.start();
      setTimeout(function () {
        loading.stop();
        var rn = _.random(0, totalPower + boss.power);
        if (rn <= totalPower) {
          roundsWon++;
          console.log(colors.bold(player.name) + " wins this round!");
        } else {
          roundsLost++;
          console.log(colors.bold(boss.name) + " wins this round!");
        }
        round++;
        console.log(colors.bold.yellow("Round " + round + " out of 3"));
        loading.start();
        setTimeout(function () {
          loading.stop();
          var rn = _.random(0, totalPower + boss.power);
          if (rn <= totalPower) {
            roundsWon++;
            console.log(colors.bold(player.name) + " wins this round!");
          } else {
            roundsLost++;
            console.log(colors.bold(boss.name) + " wins this round!");
          }
          if (roundsWon === 2) {
            console.log(
              colors.bold(player.name) +
              " has defeated " +
              colors.bold(boss.name)
            );
            callback(boss.reward);
          } else if (roundsLost === 2) {
            console.log(
              colors.bold(boss.name) +
              " has defeated " +
              colors.bold(player.name)
            );
            callback();
          } else {
            round++;
            console.log(colors.bold.yellow("Round " + round + " out of 3"));
            loading.start();
            setTimeout(function () {
              loading.stop();
              var rn = _.random(0, totalPower + boss.power);
              if (rn <= totalPower) {
                roundsWon++;
                console.log(colors.bold(player.name) + " wins this round!");
              } else {
                roundsLost++;
                console.log(colors.bold(boss.name) + " wins this round!");
              }
              if (roundsWon === 2) {
                console.log(
                  colors.bold(player.name) +
                  " has defeated " +
                  colors.bold(boss.name)
                );
                callback(boss.reward);
              } else if (roundsLost === 2) {
                console.log(
                  colors.bold(boss.name) +
                  " has defeated " +
                  colors.bold(player.name)
                );
                callback();
              } else {
                round++;
              }
            }, 2000);
          }
        }, 2000);
      }, 2000);
    }
  );
};

function getTotalPower(player) {
  var totalPower = player.power;
  if (player.party.length > 0) {
    for (var i = 0; i < player.party.length; i++) {
      totalPower += player.party[i].power;
    }
  }
  return totalPower;
}

module.exports = battleEngine;
