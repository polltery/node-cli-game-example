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

 module.exports = {
    create2dArray
 };
