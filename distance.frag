precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;

#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

bool isSameSide( float _col, bool _inside ) {
  return ( _col < 0.0 ) == _inside;
}

float getDist( vec4 _i ) {
  return ( _i.y < 0.5 ?
  #ifdef HORI
    -1E2 : 1E2
  #endif

  #ifdef VERT
    -1.0 : 1.0 ) * ( _i.x - 0.5 / 255.0
  #endif
  );
}

void main() {
  vec2 p = gl_FragCoord.xy;

  #ifdef HORI
    vec2 gap = V.yx;
    float reso = resolution.x;
    float coord = gl_FragCoord.x;
  #endif

  #ifdef VERT
    vec2 gap = V.xy;
    float reso = resolution.y;
    float coord = gl_FragCoord.y;
  #endif

  float dist = getDist( texture2D( texture, p / resolution ) );
  bool inside = isSameSide( dist, true );

  dist = abs( dist );

  for ( int iLoop = 1; iLoop < 256; iLoop ++ ) {
    float i = float( iLoop );
    float d = ( i - 0.5 ) / 255.0;
    if ( dist < d ) { break; }

    for ( int iiLoop = -1; iiLoop < 2; iiLoop += 2 ) {
      float ii = float( iiLoop );
      vec2 tCoord = p + ii * i * gap;
      if ( 0.0 <= tCoord.x && tCoord.x < resolution.x && 0.0 <= tCoord.y && tCoord.y < resolution.y ) {
        float col = getDist( texture2D( texture, tCoord / resolution ) );
        dist = min(
          dist,
          length( vec2( d, isSameSide( col, inside ) ? col : 0.0 ) )
        );
      }
    }
  }

  gl_FragColor = vec4( dist, inside ? 0.0 : 1.0, 0.0, 1.0 );
}
