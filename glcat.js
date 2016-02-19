// GLCat
// Author: FMS_Cat
// WebGL APIになるべく近い形で、かつ簡単に扱えることを目指すライブラリ

// GLCatが持つ変数は
// - program
// のみ
// 将来的にはviewportのwidth, heightを入れたい
// なるべく少なくして実際のAPIに近づけることを目指す

var GLCat = function( _gl ){

	this.gl = _gl;
	var it = this;
  var gl = it.gl;

  gl.enable( gl.DEPTH_TEST );
  gl.depthFunc( gl.LEQUAL );
  gl.enable( gl.BLEND );
  gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

  gl.getExtension( 'OES_texture_float' );
	gl.getExtension( 'OES_float_linear' );
	gl.getExtension( 'OES_half_float_linear' );

	it.program = null;

};

GLCat.prototype.createProgram = function( _vert, _frag, _onError ){

	var it = this;
	var gl = it.gl;

	var error;
	if( typeof _onError === 'function' ){
		error = _onError;
	}else{
		error = function( _str ){ console.error( _str ); }
	}

	var vert = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vert, _vert );
	gl.compileShader( vert );
	if( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) ){
		error( gl.getShaderInfoLog( vert ) );
		return null;
	}

	var frag = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( frag, _frag );
	gl.compileShader( frag );
	if(!gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ){
		error( gl.getShaderInfoLog( frag ) );
		return null;
	}

	var program = gl.createProgram();
	gl.attachShader( program, vert );
	gl.attachShader( program, frag );
	gl.linkProgram( program );
	if( gl.getProgramParameter( program, gl.LINK_STATUS ) ){
    program.locations = {};
		return program;
	}else{
		error( gl.getProgramInfoLog( program ) );
		return null;
	}

};

GLCat.prototype.useProgram = function( _program ) {

	var it = this;
	var gl = it.gl;

	gl.useProgram( _program );
	it.program = _program;

};

GLCat.prototype.createVertexbuffer = function( _array ){

	var it = this;
	var gl = it.gl;

  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;

};

GLCat.prototype.createIndexbuffer = function( _array ){

	var it = this;
	var gl = it.gl;

  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;

};

GLCat.prototype.attribute = function( _name, _buffer, _stride ){

	var it = this;
	var gl = it.gl;

  var location;
  if( it.program.locations[ _name ] ){
    location = it.program.locations[ _name ];
  }else{
    location = gl.getAttribLocation( it.program, _name );
    it.program.locations[ _name ] = location;
  }

  gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
  gl.enableVertexAttribArray( location );
  gl.vertexAttribPointer( location, _stride, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, null );

};

GLCat.prototype.getUniformLocation = function( _name ){

	var it = this;
	var gl = it.gl;

  var location;

  if ( it.program.locations[ _name ] ) {
		location = it.program.locations[ _name ];
	} else {
		location = gl.getUniformLocation( it.program, _name );
		it.program.locations[ _name ] = location;
	}

  return location;

};

GLCat.prototype.uniform1i = function( _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _name );
	gl.uniform1i( location, _value );

};

GLCat.prototype.uniform1f = function( _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _name );
	gl.uniform1f( location, _value );

};

GLCat.prototype.uniform2fv = function( _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _name );
	gl.uniform2fv( location, _value );

};

GLCat.prototype.uniform3fv = function( _name, _value ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _name );
	gl.uniform3fv( location, _value );

};

GLCat.prototype.uniformCubemap = function( _name, _texture, _number ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _name );
  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_CUBE_MAP, _texture );
  gl.uniform1i( location, _number );

};

GLCat.prototype.uniformTexture = function( _name, _texture, _number ){

	var it = this;
	var gl = it.gl;

	var location = it.getUniformLocation( _name );
  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_2D, _texture );
  gl.uniform1i( location, _number );

};

GLCat.prototype.createTexture = function(){

	var it = this;
	var gl = it.gl;

	var texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
	gl.bindTexture( gl.TEXTURE_2D, null );

	return texture;

};

GLCat.prototype.setTexture = function( _texture, _image ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.setTextureFromArray = function( _texture, _width, _height, _array ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.setTextureFromFloatArray = function( _texture, _width, _height, _array ){

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.copyTexture = function( _texture, _width, _height ) {

	var it = this;
	var gl = it.gl;

	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.copyTexImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, _width, _height, 0 );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

GLCat.prototype.createCubemap = function( _arrayOfImage ){

	var it = this;
	var gl = it.gl;

	// order : X+, X-, Y+, Y-, Z+, Z-
	var texture = gl.createTexture();

	gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture );
	for( var i=0; i<6; i++ ){
		gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _arrayOfImage[ i ] );
	}
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );

	return texture;

};

GLCat.prototype.createFramebuffer = function( _width, _height ){

	var it = this;
	var gl = it.gl;

  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

	framebuffer.texture = it.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
  gl.bindTexture( gl.TEXTURE_2D, null );

  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

  return framebuffer;

};

GLCat.prototype.createFloatFramebuffer = function( _width, _height ){

	var it = this;
	var gl = it.gl;

  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

	framebuffer.depth = gl.createRenderbuffer();
	gl.bindRenderbuffer( gl.RENDERBUFFER, framebuffer.depth );
	gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
  gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth );

	framebuffer.texture = it.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.bindTexture( gl.TEXTURE_2D, null );

  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

  return framebuffer;

};

GLCat.prototype.clear = function( _r, _g, _b, _a, _d ){

	var it = this;
	var gl = it.gl;

	var r = _r || 0.0;
	var g = _g || 0.0;
	var b = _b || 0.0;
	var a = typeof _a === 'number' ? _a : 1.0;
	var d = typeof _d === 'number' ? _d : 1.0;

  gl.clearColor( r, g, b, a );
  gl.clearDepth( d );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

};
