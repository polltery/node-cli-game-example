var debug = {};

var color = require('colors');

debug.show2dArrayContents = function(map){
    showDebugStart();
    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++) {
            console.log(i+':'+j+'\n'+JSON.stringify(map[i][j]));
        }
    }
    showDebugEnd();
}

function showDebugStart(){
    console.log('= = = = = = = DEBUG INFO = = = = = = = = '.red);
}

function showDebugEnd(){
    console.log('x x x x x x x DEBUG INFO x x x x x x x x '.red);
}

module.exports = debug;