seed = 1;
function xorshift() {
  seed = seed ^ ( seed << 13 );
  seed = seed ^ ( seed >>> 17 );
  seed = seed ^ ( seed << 5 );
  return seed / 4294967296 + 0.5;
}

bufferSize = 512;
audioProgress = 0;
audio = new AudioContext();
src = audio.createBufferSource();

distSize = 2048;
canvas = document.getElementById( 'c' );
canvas.style.width = screen.width + 'px';
canvas.style.height = screen.height + 'px';

gl = canvas.getContext( 'webgl' ) || it.canvas.getContext( 'experimental-webgl' );
glCat = new GLCat( gl );

params = { x: 0.01, y: 0.01, z: 0.01 };
gui = new dat.GUI();
gui.add( params, 'x', 0.0, 1.0 );
gui.add( params, 'y', 0.0, 1.0 );
gui.add( params, 'z', 0.0, 1.0 );

quadVBO = glCat.createVertexbuffer( [1,-1,1,1,-1,-1,-1,1] );

randomTexture = glCat.createTexture();
glCat.setTextureFromArray( randomTexture, 256, 256, ( function() {
  a = new Uint8Array( 262144 );
  for ( i = 0; i < 262144; i ++ ) {
    a[ i ] = xorshift() * 256;
  }
  return a;
} )() );

step( {

  0: function( _step ) {
    requestText( 'raymarch.frag', function( _text ) {
      fragRaymarch = _text;
      _step();
    } );

    requestText( 'distance.frag', function( _text ) {
      fragDistance = _text;
      _step();
    } );

    requestText( 'music.frag', function( _text ) {
      fragMusic = _text;
      _step();
    } );
  },

  3: function( _step ) {

    vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    programRaymarch = glCat.createProgram( vert, fragRaymarch );
    programDistanceH = glCat.createProgram( vert, '#define HORI\n'+fragDistance );
    programDistanceV = glCat.createProgram( vert, '#define VERT\n'+fragDistance );
    programMusic = glCat.createProgram( vert, fragMusic );

    // ------

    wordCanvas = document.createElement( 'canvas' );
    wordCanvas.width = distSize;
    wordCanvas.height = distSize;
    wordContext = wordCanvas.getContext( '2d' );

    wordPre = glCat.createTexture();
    array = new Uint8Array( distSize * distSize * 4 );
    horiTexture = glCat.createTexture();
    wordTextures = ( function() {
      a = [
        '///////////////',
        'FMS_Cat',
        'Greetings:',
        'ASD',
        'Ctrl-Alt-Test',
        'doxas',
        'gyabo',
        'MetroGirl',
        'primitive',
        'Radium Software',
        'Razor1911',
        'rgba',
        'RTX1911',
        'System K',
        'xplsv',
        '00',
        '01',
        '[ Type ]'
      ];
      for ( i = 0; i < 32; i ++ ) {
        s = '';
        for ( j = 0; j < 8; j ++ ) {
          s += String.fromCharCode( Math.pow( xorshift(), 4.0 ) * 65536 );
        }
        a.push( s );
      }
      return a;
    } )().map( function( _v ) {
      wordContext.fillStyle = '#000';
      wordContext.fillRect( 0, 0, distSize, distSize );

      wordContext.fillStyle = '#fff';
      wordContext.font = '500 200px Arial';
      wordContext.textAlign = 'center';
      wordContext.textBaseline = 'middle';
      wordContext.fillText( _v, distSize / 2, distSize / 2 );

      // ------

      glCat.setTexture( wordPre, wordCanvas );
      var texture = glCat.createTexture();

      // ------

      glCat.useProgram( programDistanceH );

      glCat.attribute( 'p', quadVBO, 2 );
      glCat.uniform2fv( 'resolution', [ distSize, distSize ] );
      glCat.uniformTexture( 'texture', wordPre, 0 );

      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      gl.readPixels( 0, 0, distSize, distSize, gl.RGBA, gl.UNSIGNED_BYTE, array );
      glCat.setTextureFromArray( horiTexture, distSize, distSize, array );

      // ------

      glCat.useProgram( programDistanceV );

      glCat.attribute( 'p', quadVBO, 2 );
      glCat.uniform2fv( 'resolution', [ distSize, distSize ] );
      glCat.uniformTexture( 'texture', horiTexture, 0 );

      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      gl.readPixels( 0, 0, distSize, distSize, gl.RGBA, gl.UNSIGNED_BYTE, array );
      glCat.setTextureFromArray( texture, distSize, distSize, array );

      gl.flush();

      // ------

      return texture;
    } );

    // ------

    buffer = audio.createBuffer( 2, 7938000, 44100 );
    bufferL = buffer.getChannelData( 0 );
    bufferR = buffer.getChannelData( 1 );

    for ( i = 0; i < 120; i ++ ) {
      glCat.useProgram( programMusic );

      glCat.attribute( 'p', quadVBO, 2 );
      glCat.uniform1f( 'i', i );
      glCat.uniformTexture( 'randomTexture', randomTexture, 0 );

      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      gl.flush();
      array = new Uint8Array( 65536 * 4 );
      gl.readPixels( 0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, array );

      for ( j = 0; j < 65536; j ++ ) {
        bufferL[ i * 65536 + j ] = array[ j * 4 ] / 128 - 1;
        bufferR[ i * 65536 + j ] = array[ j * 4 + 1 ] / 128 - 1;
      }
    }

    canvas.width = 1280 * 0.5;
    canvas.height = 720 * 0.5;
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    function update() {

      time = ( audio.currentTime - beginTime ) * 175.0 / 60.0 - 8.0;

      glCat.useProgram( programRaymarch );

      glCat.attribute( 'p', quadVBO, 2 );
      glCat.uniform1f( 'time', time );
      glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );
      glCat.uniform3fv( 'param', [ params.x, params.y, params.z ] );
      glCat.uniformTexture( 'wordTexture', wordTextures[
        time < 192
        ? 0
        : 320 < time
        ? 18 + Math.floor( time * 2.0 ) % 32
        : Math.min( Math.floor( ( time - 176 ) / 16 ) * 2, 17 )
      ], 0 );
      glCat.uniformTexture( 'wordTexture2', wordTextures[
        time < 192
        ? 1
        : Math.min( Math.floor( ( time - 184 ) / 16 ) * 2 + 1, 17 )
      ], 1 );
      glCat.uniformTexture( 'randomTexture', randomTexture, 2 );

      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      gl.flush();

      frame ++;
      requestAnimationFrame( update );

    }

    a = document.getElementById( 'a' );
    a.style.display = 'block';

    a.onclick = function() {
      beginTime = audio.currentTime + 1;
      frame = 0;

      src.buffer = buffer;
      src.connect( audio.destination );
      src.start( beginTime );

      if ( canvas.requestFullscreen ) {
        canvas.requestFullscreen();
      } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
      } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
      }

      update();
    }

  }

} );
