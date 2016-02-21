#define saturate(i) clamp(i,0.,1.)

uniform bool v;
uniform sampler2D t;

bool isSameSide( float _col, bool _inside ) {
  return ( _col < 0.0 ) == _inside;
}

float getDist( vec4 _i ) {
  return ( _i.y < 0.5 ? -1.0 : 1.0 ) * ( v ? ( _i.x - 0.5 / 255.0 ) : 1E2 );
}

void main() {
  float distSize = 2048.0;
  vec2 p = gl_FragCoord.xy;

  vec2 gap = V.yx;
  float reso = distSize;
  float coord = gl_FragCoord.x;

  if ( v ) {
    gap = V.xy;
    reso = distSize;
    coord = gl_FragCoord.y;
  }

  float dist = getDist( texture2D( t, p / distSize ) );
  bool inside = isSameSide( dist, true );

  dist = abs( dist );

  for ( int iLoop = 1; iLoop < 256; iLoop ++ ) {
    float i = float( iLoop );
    float d = ( i - 0.5 ) / 255.0;
    if ( dist < d ) { break; }

    for ( int iiLoop = -1; iiLoop < 2; iiLoop += 2 ) {
      float ii = float( iiLoop );
      vec2 tCoord = p + ii * i * gap;
      if ( 0.0 <= tCoord.x && tCoord.x < distSize && 0.0 <= tCoord.y && tCoord.y < distSize ) {
        float col = getDist( texture2D( t, tCoord / distSize ) );
        dist = min(
          dist,
          length( vec2( d, isSameSide( col, inside ) ? col : 0.0 ) )
        );
      }
    }
  }

  gl_FragColor = vec4( dist, inside ? 0.0 : 1.0, 0.0, 1.0 );
}
