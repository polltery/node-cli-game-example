var utils = {};

// Function for creating a 2d ARRAY!
utils.create2dArray = function(numrows, numcols, initial){

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

module.export = utils;