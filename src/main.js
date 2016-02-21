var seed;
function xorshift() {
  seed = seed ^ ( seed << 13 ) || 1;
  seed = seed ^ ( seed >>> 17 );
  seed = seed ^ ( seed << 5 );
  return seed / Math.pow( 2, 32 ) + .5;
}

var myAudio = new AudioContext();
var mySrc = myAudio.createBufferSource();

var myDistSize = 2048;
var myDistSizeSq = myDistSize * myDistSize;
C.style.width = screen.width + 'px';
C.style.height = screen.height + 'px';

// ------

var myGl = C.getContext( 'webgl' ) || C.getContext( 'experimental-webgl' );

// ------

function myCreateProgram( a ) {

  var vert = myGl.createShader( myGl.VERTEX_SHADER );
  myGl.shaderSource( vert, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}' );
  myGl.compileShader( vert );

  var frag = myGl.createShader( myGl.FRAGMENT_SHADER );
  myGl.shaderSource( frag, 四 + a );
  myGl.compileShader( frag );

  var program = myGl.createProgram();
  myGl.attachShader( program, vert );
  myGl.attachShader( program, frag );
  myGl.linkProgram( program );
  myGl.getProgramParameter( program, myGl.LINK_STATUS );
  program.l = {};
  return program;

}

function myCreateTexture() {

  var myTexture = myGl.createTexture();
	myGl.bindTexture( myGl.TEXTURE_2D, myTexture );
  myGl.texParameteri( myGl.TEXTURE_2D, myGl.TEXTURE_MAG_FILTER, myGl.LINEAR );
  myGl.texParameteri( myGl.TEXTURE_2D, myGl.TEXTURE_MIN_FILTER, myGl.LINEAR );
  myGl.texParameteri( myGl.TEXTURE_2D, myGl.TEXTURE_WRAP_S, myGl.REPEAT );
  myGl.texParameteri( myGl.TEXTURE_2D, myGl.TEXTURE_WRAP_T, myGl.REPEAT );
  return myTexture;

}

function mySetTexture( a, b, c, d ) {

	myGl.bindTexture( myGl.TEXTURE_2D, a );
  myGl.texImage2D( myGl.TEXTURE_2D, 0, myGl.RGBA, b, c, 0, myGl.RGBA, myGl.UNSIGNED_BYTE, new Uint8Array( d ) );

}

var myLocation;
function myFindLocation( a ) {

  if ( program.l[ a ] ) {
    myLocation = program.l[ a ];
  } else {
    myLocation = myGl.getUniformLocation( program, a );
    program.l[ a ] = myLocation;
  }
  return myLocation;

}

var quadVBO = myGl.createBuffer();
myGl.bindBuffer( myGl.ARRAY_BUFFER, quadVBO );
myGl.bufferData( myGl.ARRAY_BUFFER, new Float32Array( [1,-1,1,1,-1,-1,-1,1] ), myGl.STATIC_DRAW );

var program;
function myUseProgram( a ) {

  program = a;
  myGl.useProgram( program );

  var myLocation = myGl.getAttribLocation( program, 'p' );

  myGl.enableVertexAttribArray( myLocation );
  myGl.vertexAttribPointer( myLocation, 2, myGl.FLOAT, false, 0, 0 );

}

function myUniformTexture( a, b, c ) {

  myGl.activeTexture( myGl.TEXTURE0 + c );
  myGl.bindTexture( myGl.TEXTURE_2D, b );
  myGl.uniform1i( a, c );

}

// ------

var randomTexture = myCreateTexture();
mySetTexture( randomTexture, myDistSize, myDistSize, ( function() {
  var tempArray = new Uint8Array( myDistSizeSq * 4 );
  for ( i = 0; i < myDistSizeSq * 4; i ++ ) {
    tempArray[ i ] = xorshift() * 256;
  }
  return tempArray;
} )() );

// ------

var myBuffer = myAudio.createBuffer( 2, 7000000, 44100 );
myUseProgram( myCreateProgram( 参 ) );

for ( i = 0; i < 2; i ++ ) {

  myGl.uniform1f( myFindLocation( 'i' ), i );
  myUniformTexture( myFindLocation( 'randomTexture' ), randomTexture, 0 );

  myGl.drawArrays( myGl.TRIANGLE_STRIP, 0, 4 );
  myGl.flush();
  myGl.readPixels( 0, 0, myDistSize, myDistSize, myGl.RGBA, myGl.UNSIGNED_BYTE, tempArray );

  for ( j = 0; j < myDistSizeSq; j ++ ) {
    if ( i * myDistSizeSq + j < 7000000 ) {
      myBuffer.getChannelData( 0 )[ i * myDistSizeSq + j ] = tempArray[ j * 4 ] / 128 - 1;
      myBuffer.getChannelData( 1 )[ i * myDistSizeSq + j ] = tempArray[ j * 4 + 1 ] / 128 - 1;
    }
  }
}

// ------

myUseProgram( myCreateProgram( 弐 ) );

var wordCanvas = document.createElement( 'canvas' );
wordCanvas.width = myDistSize;
wordCanvas.height = myDistSize;
var wordContext = wordCanvas.getContext( '2d' );

var wordPre = myCreateTexture();
var tempArray = new Uint8Array( myDistSizeSq * 4 );
var horiTexture = myCreateTexture();
var wordTextures = ( function() {
  var moreTempArray = [
    '///////////////',
    'FMS_Cat',
    'Greetings:',
    'ASD',
    'Ctrl-Alt-Test',
    'doxas',
    'gyabo',
    'MetroGirl',
    'nikq::club',
    'orange',
    'primitive',
    'quite',
    'Radium Software',
    'rgba',
    'RTX1911',
    'SystemK',
    'xplsv',
    '[ Type ]'
  ];
  for ( i = 0; i < 32; i ++ ) {
    var tempStr = '';
    for ( j = 0; j < 8; j ++ ) {
      tempStr += String.fromCharCode( Math.pow( xorshift(), 4 ) * 65536 );
    }
    moreTempArray.push( tempStr );
  }
  return moreTempArray;
} )().map( function( a ) {
  wordContext.fillStyle = '#000';
  wordContext.fillRect( 0, 0, myDistSize, myDistSize );

  wordContext.fillStyle = '#fff';
  wordContext.font = '500 200px Arial';
  wordContext.textAlign = 'center';
  wordContext.textBaseline = 'middle';
  wordContext.fillText( a, myDistSize / 2, myDistSize / 2 );

  // ------

  mySetTexture( wordPre, myDistSize, myDistSize, wordContext.getImageData( 0, 0, myDistSize, myDistSize ).data );
  var tempTexture = myCreateTexture();

  // ------

  myGl.uniform1i( myFindLocation( 'v' ), 0 );
  myUniformTexture( myFindLocation( 't' ), wordPre, 0 );

  myGl.drawArrays( myGl.TRIANGLE_STRIP, 0, 4 );
  myGl.readPixels( 0, 0, myDistSize, myDistSize, myGl.RGBA, myGl.UNSIGNED_BYTE, tempArray );
  mySetTexture( horiTexture, myDistSize, myDistSize, tempArray );

  // ------

  myGl.uniform1i( myFindLocation( 'v' ), 1 );
  myUniformTexture( myFindLocation( 't' ), horiTexture, 0 );

  myGl.drawArrays( myGl.TRIANGLE_STRIP, 0, 4 );
  myGl.readPixels( 0, 0, myDistSize, myDistSize, myGl.RGBA, myGl.UNSIGNED_BYTE, tempArray );
  mySetTexture( tempTexture, myDistSize, myDistSize, tempArray );

  myGl.flush();

  // ------

  return tempTexture;
} );

// ------

C.width = 1280;
C.height = 720;
myGl.viewport( 0, 0, C.width, C.height );
myGl.bindFramebuffer( myGl.FRAMEBUFFER, null );
myUseProgram( myCreateProgram( 壱 ) );

var myBeginTime;

function update() {

  var myTime = ( myAudio.currentTime - myBeginTime ) * 175 / 60 - 8;

  myGl.uniform1f( myFindLocation( 'u_time' ), myTime );
  myGl.uniform2fv( myFindLocation( 'u_resolution' ), [ C.width, C.height ] );
  myUniformTexture( myFindLocation( 'u_texture' ), randomTexture, 0 );
  myUniformTexture( myFindLocation( 'u_wordTexture' ), wordTextures[
    myTime < 192
    ? 0
    : 320 < myTime
    ? 18 + Math.floor( myTime * 2 ) % 32
    : Math.min( Math.floor( ( myTime - 176 ) / 16 ) * 2, 17 )
  ], 1 );
  myUniformTexture( myFindLocation( 'u_wordTexture2' ), wordTextures[
    myTime < 192
    ? 1
    : Math.min( Math.floor( ( myTime - 184 ) / 16 ) * 2 + 1, 17 )
  ], 2 );

  myGl.drawArrays( myGl.TRIANGLE_STRIP, 0, 4 );
  myGl.flush();

  requestAnimationFrame( update );

}

A.innerText = 'Click';
A.onclick = function() {
  myBeginTime = myAudio.currentTime + 1;

  mySrc.buffer = myBuffer;
  mySrc.connect( myAudio.destination );
  mySrc.start( myBeginTime );

  if ( C.requestFullscreen ) {
    C.requestFullscreen();
  } else if (C.msRequestFullscreen) {
    C.msRequestFullscreen();
  } else if (C.mozRequestFullScreen) {
    C.mozRequestFullScreen();
  } else if (C.webkitRequestFullscreen) {
    C.webkitRequestFullscreen();
  }

  update();
}
