// _waves: array of array( Float32Array is preffered ). ex) [ waveL, waveR ]
// _props.rate: sampling rate. default is 44100
// _props.bit: bit depth of wave. default is 16
// _props.amp: amplification. default is 1.0
// _props.raw: true it if wave is raw
// _props.download: if assigned, blob downloaded automatically and the property will be filename

var arrayToWav = function( _waves, _props ) {

  var setBin = function( _array, _value, _offset, _length ) {
		var value = Math.floor( _value );
		for ( var iByte = 0; iByte < _length; iByte ++ ) {
			_array[ _offset + iByte ] = value & 255;
			value = value >> 8;
		}
	}

  var setAscii = function( _array, _string, _offset ) {
    for ( var iChar = 0; iChar < _string.length; iChar ++ ) {
      _array[ _offset + iChar ] = _string.charCodeAt( iChar );
    }
  }

  var clamp = function( _value, _min, _max ) {
    return Math.min( Math.max( _value, _min ), _max );
  }

  var channel = _waves.length;
  var len = _waves[ 0 ].length;
  for ( var iCh = 1; iCh < channel; iCh ++ ) {
    if ( _waves[ iCh ].length !== len ) {
      console.error( 'arrayToWav: length of each channel is wrong' );
  	  return null;
    }
  }

  var bit = _props.bit || 16;
  if ( ( bit & 7 ) !== 0 ) {
    console.error( 'arrayToWav: bit depth must be 8*n' );
	  return null;
  }
  var byte = bit >> 3;

  var rate = _props.rate || 44100;
  var amp = _props.amp || 1.0;
  var raw = _props.raw || false;
  var multiplier = amp * ( 1 << ( bit - 1 ) );

	var out = new Uint8Array( 44 + len * byte * channel );

  setAscii( out, 'RIFF', 0 );
	setBin( out, 36 + len * byte * channel, 4, 4 ); // total - 8byte
  setAscii( out, 'WAVE', 8 );
  setAscii( out, 'fmt ', 12 );
  setBin( out, 16, 16, 4 ); // fmt chunk byte
	setBin( out, 1, 20, 2 ); // format
	setBin( out, channel, 22, 2 ); // channel
	setBin( out, rate, 24, 4 ); // sampling rate
	setBin( out, rate * byte * channel, 28, 4 ); // byte per sec
	setBin( out, byte * channel, 32, 2 ); // byte per sample * channel
	setBin( out, bit, 34, 2 ); // bit per sample
  setAscii( out, 'data', 36 );
	setBin( out, len * byte * channel, 40, 4 ); // data chunk byte

  var index = 44;
  for ( var iSample = 0; iSample < len; iSample ++ ) {
    for ( var iCh = 0; iCh < channel; iCh ++ ) {
      var value = 0;
      if ( raw ) {
        value = _waves[ iCh ][ iSample ];
      } else {
        if ( byte === 1 ) {
          value = clamp(
            ( _waves[ iCh ][ iSample ] + 1.0 ) * multiplier,
            0,
            255
          );
        } else {
          value = clamp(
            ( _waves[ iCh ][ iSample ] ) * multiplier,
            -( 1 << ( bit - 1 ) ),
            ( 1 << ( bit - 1 ) ) - 1
          );
        }
      }
      setBin( out, value, index, byte );
      index += byte;
    }
  }

	var blob = new Blob( [ out ], { 'type': 'application/x-msdownload' } );

  if ( _props.download ) {
  	window.URL = window.URL || window.webkitURL;
    var aLink = document.createElement( 'a' );
  	aLink.href = window.URL.createObjectURL( blob );
  	aLink.download = _props.download;
    aLink.click();
  }

  return blob;

};
