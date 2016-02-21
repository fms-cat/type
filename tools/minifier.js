( function() {
  'use strict';

  let fs = require( 'fs' );
  let cp = require( 'child_process' );

  let killSpace = function( str ) {
    let 逃がすやつ = [
      'new ',
      'function ',
      'return ',
      'var ',
      'attribute vec2 p',
      'void main',
      'Radium Software',
      ' Type ',
    ];

    str = str.replace( /else if/g, 'else空if' );
    逃がすやつ.map( function( _v ) {
      let reg = _v;
      let rep = _v.replace( / /g, '空' );
      str = str.replace( new RegExp( reg, 'g' ), rep );
    } );
    str = str.replace( / /g, '' );
    str = str.replace( /空/g, ' ' );
    return str;
  }

  let killComment = function( str ) {
    str = str.replace( '///////////////', '斜' );
    str = str.replace( /\/\/.*/g, '' );
    str = str.replace( '斜', '///////////////' );
    return str;
  }

  let replacer = 'efghlmnopqrstuvwxyzBDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' );

  // ------

  let ret = fs.readFileSync( 'src/main.js', 'utf8' );

  // ------

  let glslDefs = [
    [ 'F', 'float' ],
    [ 'D', 'vec2' ],
    [ 'T', 'vec3' ],
    [ 'Q', 'vec4' ],
  ];

  let glslHead = 'precision highp float;\\n#define P 3.14159265\\n'
  glslDefs.map( function( _v ) {
    glslHead += '#define ' + _v[ 0 ] + ' ' + _v[ 1 ] + '\\n';
  } );
  glslHead += '#define V D(0.,1.)\\n';

  // ------

  let createCommand = function( _filename ) {
    return 'mono tools/shader_minifier.exe ' + _filename + ' -o temp --format none --preserve-externals --no-renaming-list F,D,T,Q,P,V,main';
  }

  cp.execSync( createCommand( 'src/raymarch.frag' ) );
  let fragRaymarch = fs.readFileSync( 'temp', 'utf8' );
  fragRaymarch = fragRaymarch.replace( /\n/g, '\\n' );
  glslDefs.map( function( _v, _i ) {
    fragRaymarch = fragRaymarch.replace( new RegExp( _v[ 1 ], 'g' ), _v[ 0 ] );
  } );

  cp.execSync( createCommand( 'src/music.frag' ) );
  let fragMusic = fs.readFileSync( 'temp', 'utf8' );
  fragMusic = fragMusic.replace( /\n/g, '\\n' );
  glslDefs.map( function( _v, _i ) {
    fragMusic = fragMusic.replace( new RegExp( _v[ 1 ], 'g' ), _v[ 0 ] );
  } );

  cp.execSync( createCommand( 'src/distance.frag' ) );
  let fragDistance = fs.readFileSync( 'temp', 'utf8' );
  fragDistance = fragDistance.replace( /\n/g, '\\n' );
  glslDefs.map( function( _v, _i ) {
    fragDistance = fragDistance.replace( new RegExp( _v[ 1 ], 'g' ), _v[ 0 ] );
  } );

  // ------

  ret = killComment( ret );
  ret = ret.replace( /\n/g, '' );
  ret = killSpace( ret );

  let iReplacer = 0;
  let reFunc = /function ([^(]+)/g;
  while ( true ) {
    let f = reFunc.exec( ret );
    if ( f ) {
      ret = ret.replace( new RegExp( '\\b' + f[ 1 ] + '\\b', 'g' ), replacer[ iReplacer ] );
      iReplacer ++;
    } else {
      break;
    }
  }

  let reVar = /var ([^;=]+)/g;
  while ( true ) {
    let v = reVar.exec( ret );
    if ( v ) {
      ret = ret.replace( new RegExp( '\\b' + v[ 1 ] + '\\b', 'g' ), replacer[ iReplacer ] );
      iReplacer ++;
    } else {
      break;
    }
  }
  ret = ret.replace( new RegExp( 'var ([^;=]+);', 'g' ), '定義$1;' );
  ret = ret.replace( new RegExp( 'var ', 'g' ), '' );
  ret = ret.replace( new RegExp( '定義([^;=]+);', 'g' ), 'var $1;' );



  /(\A|[^a-zA-Z])wow(\Z|[^a-zA-Z])/

  // ------

  ret = ret.replace( '500200pxArial', '500 200px Arial' );
  ret = ret.replace( '壱', '"' + fragRaymarch + '"' );
  ret = ret.replace( '弐', '"' + fragDistance + '"' );
  ret = ret.replace( '参', '"' + fragMusic + '"' );
  ret = ret.replace( '四', '"' + glslHead + '"' );

  // ------

  fs.unlinkSync( 'temp' );

  // ------

  fs.writeFile( 'out.js', ret, 'utf8', function( _error ) {
    if ( _error ) {
      throw _error;
    } else {
      console.log( 'done🍕  🌮  🍣' );
    }
  } );

} )();
