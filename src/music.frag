#define pitch(i,j) 96.0 * pow( 2.0, ( i * 5.0 + mod( i, 2.0 ) * 2.0 + ( 3.0 < i ? 6.0 : 0.0 ) + j ) / 12.0 )
#define saturate(i) clamp(i,-1.,1.)

uniform float i;

uniform sampler2D randomTexture;


vec2 random( float _p ) {
  return texture2D( randomTexture, _p * vec2( 0.79, 0.73 ) ).xy * 2.0 - 1.0;
}

void main() {
  float timeKeeper = ( i * 4194304.0 + floor( gl_FragCoord.x ) + floor( gl_FragCoord.y ) * 2048.0 ) / 44100.0 * 175.0 / 60.0 - 8.0;

  vec2 ret = V.xx;
  float step = floor( timeKeeper / 8.0 );

  if ( timeKeeper < 0.0 || abs( timeKeeper - 63.75 ) < 0.25 ) {

    if ( mod( timeKeeper, 1.0 ) < 0.1 ) {
      ret += sin( timeKeeper * 4096.0 / ( mod( timeKeeper, 4.0 ) < 1.0 ? 1.0 : 2.0 ) ) * 0.5;
    }

  } else {

    if ( 448.0 < timeKeeper ) {
      timeKeeper = 452.0 - exp( 448.0 - timeKeeper ) * 4.0;
      timeKeeper -= floor( ( timeKeeper - 448.0 ) * 11.9 ) / 14.0;
    }

    vec4 glitchr = ( 320.0 < timeKeeper ) ? vec4(
      random( floor( timeKeeper * 4.0 ) / 5.74 ),
      random( floor( timeKeeper * 2.0 ) / 6.74 )
    ) : V.xxxx;
    if ( glitchr.z < -0.6 ) {
      timeKeeper -= floor( mod( timeKeeper, 0.5 ) * 8.0 ) / 8.0;
    } else if ( glitchr.z < -0.4 ) {
      timeKeeper = floor( timeKeeper * 512.0 ) / 512.0;
    } else if ( glitchr.z < -0.2 ) {
      timeKeeper = timeKeeper * 1.0 - floor( mod( timeKeeper, 0.5 ) * 14.0 ) / 18.0;
    }

    float kick = (
      0.6 < glitchr.x
      ? mod( timeKeeper, 0.25 )
      : mod( timeKeeper + ( 1.5 < mod( timeKeeper, 8.0 ) ? 0.5 : 0.0 ), 2.0 )
    );
    // float kick = mod( timeKeeper, 2.0 );
    ret += sin(
      exp( -kick * 24.0 ) * 99.0 - timeKeeper * 96.0
    ) * 0.6;

    float snare = (
      glitchr.x < -0.6
      ? mod( timeKeeper, 0.25 )
      : mod( timeKeeper + 2.0, 4.0 ) + ( abs( timeKeeper - 162.0 ) < 32.0 ? 9E9 : 0.0 )
    );
    ret += saturate( (
      random( timeKeeper * 40.0 ) +
      sin( timeKeeper * 32.0 * vec2( 26.1, 25.9 ) - exp( -snare * 320.0 ) * 20.0 ) * 2.0
    ) * 2.0 * exp( -snare * 8.0 ) ) * 0.25;

    float hihat = mod( timeKeeper, 0.5 - ( 192.0 < timeKeeper ? 0.25 : 0.0 ) );
    ret += (
      random( timeKeeper * 40.0 )
    ) * exp( -hihat * 42.0 ) * saturate( snare * kick ) * 0.4;

    float click = mod( timeKeeper, 0.25 );
    if ( 32.0 < timeKeeper ) {
      ret += sin( exp( -click * 300.0 ) * random( timeKeeper ) ) * 0.8;
    }

    if ( abs( timeKeeper - 192.0 ) < 128.0 ) {
      float padPhase = clamp( timeKeeper / 32.0 - 5.0, 0.0, 1.0 );
      for ( int iLoop = 0; iLoop < 5; iLoop ++ ) {
        float i = float( iLoop );
        for ( int j = 0; j < 5; j ++ ) {
          vec2 f = ( 4.0 + random( i ) * 0.1 + random( float( j ) ) * 0.03 ) * pitch( i, 0.0 );
          ret += sin(
            timeKeeper * f
            + sin(
              timeKeeper * 4.0 * f
              + sin(
                timeKeeper * 12.0 * f
              )
            ) * padPhase * 0.2
          )
          * 0.02
          * ( 2.0 - padPhase )
          * ( j == 0 ? 1.0 : padPhase )
          * saturate( snare * kick );
          if ( timeKeeper < 160.0 ) { break; }
        }
      }
    }

    if ( 128.0 < timeKeeper ) {
      vec2 f = vec2( 8.01, 7.99 ) * pitch( mod( floor( timeKeeper * 4.0 ), 6.0 ), floor( random( floor( timeKeeper * 4.0 ) / 7.3 ).x * 3.0 ) * 12.0 );
      ret += sin(
        timeKeeper * f
        + sin(
          timeKeeper * 1.0 * f
        ) * exp( -click * 12.0 )
      ) * 0.1 * exp( -click * 7.0 )
      * saturate( snare * kick );
    }

  }

  gl_FragColor = vec4( ret * 0.5 + 0.5, 0.0, 1.0 );
}
