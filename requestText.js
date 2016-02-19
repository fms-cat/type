var requestText = function( _url, _callback ){
  var xhr = new XMLHttpRequest();
  xhr.open( 'GET', _url, true );
  xhr.responseType = 'text';
  xhr.onload = function( _e ){
    if( typeof _callback === 'function' ){
      _callback( this.response );
    }
  };
  xhr.send();
};

var requestImage = function( _url, _callback ){
  var image = new Image();
  image.src = _url;
  image.onload = function(){
    if( typeof _callback === 'function' ){
      _callback( image );
    }
  };
};
