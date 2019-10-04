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

function assignTypesToCards() {
    const monsters = require('./lib/monsters.js');
    const bosses = require('./lib/bosses.js');
    const specials = require('./lib/specials.js');
    const friends = require('./lib/friends.js');

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
}

module.exports = {
    create2dArray,
    assignTypesToCards
};
