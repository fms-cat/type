precision highp float;

uniform float i;
uniform float bufferSize;

uniform sampler2D randomTexture;

#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,-1.,1.)

#define pitch(i,j) 96.0 * pow( 2.0, ( i * 5.0 + mod( i, 2.0 ) * 2.0 + ( 3.0 < i ? 6.0 : 0.0 ) + j ) / 12.0 )

vec2 random( float _p ) {
  return texture2D( randomTexture, _p * vec2( 0.79, 0.73 ) ).xy * 2.0 - 1.0;
}

void main() {
  float t = ( i * 256.0 * 256.0 + floor( gl_FragCoord.x ) + floor( gl_FragCoord.y ) * 256.0 ) / 44100.0 * 175.0 / 60.0 - 8.0;

  vec2 ret = V.xx;
  float step = floor( t / 8.0 );

  if ( t < 0.0 || abs( t - 63.75 ) < 0.25 ) {

    if ( mod( t, 1.0 ) < 0.1 ) {
      ret += sin( t * 4096.0 / ( mod( t, 4.0 ) < 1.0 ? 1.0 : 2.0 ) ) * 0.5;
    }

  } else {

    if ( 448.0 < t ) {
      t = 452.0 - exp( 448.0 - t ) * 4.0;
      t -= floor( ( t - 448.0 ) * 11.9 ) / 14.0;
    }

    vec4 glitchr = ( 320.0 < t ) ? vec4(
      random( floor( t * 4.0 ) / 4.1 ),
      random( floor( t * 2.0 ) / 6.1 )
    ) : V.xxxx;
    if ( glitchr.z < -0.6 ) {
      t -= floor( mod( t, 0.5 ) * 8.0 ) / 8.0;
    } else if ( glitchr.z < -0.4 ) {
      t = floor( t * 512.0 ) / 512.0;
    } else if ( glitchr.z < -0.2 ) {
      t = t * 1.0 - floor( mod( t, 0.5 ) * 14.0 ) / 18.0;
    }

    float kick = (
      0.6 < glitchr.x
      ? mod( t, 0.25 )
      : mod( t + ( 1.5 < mod( t, 8.0 ) ? 0.5 : 0.0 ), 2.0 )
    );
    // float kick = mod( t, 2.0 );
    ret += sin(
      exp( -kick * 24.0 ) * 100.0 - t * 96.0
    ) * 0.5;

    float snare = (
      glitchr.x < -0.6
      ? mod( t, 0.25 )
      : mod( t + 2.0, 4.0 ) + ( abs( t - 162.0 ) < 32.0 ? 9E9 : 0.0 )
    );
    ret += saturate( (
      random( t * 40.0 ) +
      sin( t * 32.0 * vec2( 26.1, 25.9 ) - exp( -snare * 320.0 ) * 20.0 ) * 2.0
    ) * 2.0 * exp( -snare * 8.0 ) ) * 0.25;

    float hihat = mod( t, 0.5 - ( 192.0 < t ? 0.25 : 0.0 ) );
    ret += (
      random( t * 40.0 )
    ) * exp( -hihat * 42.0 ) * saturate( snare * kick ) * 0.4;

    float click = mod( t, 0.25 );
    if ( 32.0 < t ) {
      ret += sin( exp( -click * 300.0 ) * random( t ) ) * 0.8;
    }

    if ( abs( t - 192.0 ) < 128.0 ) {
      float padPhase = clamp( t / 32.0 - 5.0, 0.0, 1.0 );
      for ( int iLoop = 0; iLoop < 5; iLoop ++ ) {
        float i = float( iLoop );
        for ( int j = 0; j < 5; j ++ ) {
          vec2 f = ( 4.0 + random( i ) * 0.1 + random( float( j ) ) * 0.03 ) * pitch( i, 0.0 );
          ret += sin(
            t * f
            + sin(
              t * 4.0 * f
              + sin(
                t * 12.0 * f
              )
            ) * padPhase * 0.2
          )
          * 0.02
          * ( 2.0 - padPhase )
          * ( j == 0 ? 1.0 : padPhase )
          * saturate( snare * kick );
          if ( t < 160.0 ) { break; }
        }
      }
    }

    if ( 128.0 < t ) {
      vec2 f = vec2( 4.01, 3.99 ) * pitch( mod( floor( t * 4.0 ), 6.0 ), floor( random( floor( t * 4.0 ) ).x * 3.0 ) * 12.0 );
      ret += sin(
        t * f
        + sin(
          t * 2.0 * f
        ) * exp( -click * 10.0 )
      )
      * 0.1
      * exp( -click * 3.0 )
      * saturate( snare * kick );
    }

  }

  gl_FragColor = vec4( ret * 0.5 + 0.5, 0.0, 1.0 );
}
