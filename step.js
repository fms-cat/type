var step = function( _array ){
  var array = _array;
  var count = 0;

  var func = function(){
    if( typeof _array[ count ] === 'function' ){
      _array[ count ]( func );
    }
    count ++;
  };
  func();
};
