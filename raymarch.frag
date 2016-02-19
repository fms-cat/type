precision highp float;

#define MARCH_ITER 96
#define IFS_ITER 5

uniform float time;
uniform vec2 resolution;
uniform vec3 param;

uniform sampler2D wordTexture;
uniform sampler2D wordTexture2;
uniform sampler2D randomTexture;

#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

// ------

vec2 p;
float t;
float kick;
float snare;
float light;

vec3 camPos;
vec3 camTar;
vec3 camDir;
vec3 camTop;
vec3 camSid;

vec3 rayDir;
vec3 rayBeg;
float rayLen;
float rayLenSum;
vec3 rayPos;
vec4 rayCol;

float dist;
vec4 mtl;
vec4 glitch;

// ------

vec4 random( float _p ) {
  return texture2D( randomTexture, _p * vec2( 0.79, 0.73 ) ) * 2.0 - 1.0;
}

mat2 rotate2D( in float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec3 rotate( in vec3 _i, in vec3 _rot ) {
  vec3 i = _i;
  i.yz = rotate2D( _rot.x ) * i.yz;
  i.zx = rotate2D( _rot.y ) * i.zx;
  i.xy = rotate2D( _rot.z ) * i.xy;
  return i;
}

float hash( vec3 _v ) {
  return fract( sin(
    dot( _v, vec3( 7.152, 7.276, 6.876 ) ) * 172.967
  ) * 2854.21 );
}

float smin( float _a, float _b, float _k, inout float h ) {
  h = saturate( 0.5 + 0.5 * ( _b - _a ) / _k );
  return mix( _b, _a, h ) - _k * h * ( 1.0 - h );
}

// ------

void setCamera() {
  vec3 rot = vec3( 0.0 );

  float th = t * PI / 8.0;
  camPos = vec3( sin( th ), 0.0, cos( th ) ) * (
    1.0
    + 1.0 * exp( -max( 0.0, t ) )
    - 1.0 * exp( -max( 0.0, t - 64.0 ) )
    + 1.3 * exp( -max( 0.0, t - 128.0 ) )
    - 0.3 * exp( -max( 0.0, t - 192.0 ) )
  );
  camTar = vec3( 0.0, 0.0, 0.0 );
  camDir = normalize( camTar - camPos );
  camSid = normalize( cross( camDir, V.xyx ) );
  camTop = cross( camSid, camDir );
  th = sin( t * 0.3 ) * 0.2;
  camSid = cos( th ) * camSid + sin( th ) * camTop;
  camTop = cross( camSid, camDir );
}

void initRay() {
  rayDir = normalize( camSid * p.x + camTop * p.y + camDir * ( 1.0 - length( p.xy ) * 0.3 ) );
  rayBeg = camPos;
  rayLen = 1E-3;
  rayLenSum = 0.0;
  rayCol = V.xxxy;
}

// ------

float sphere( in vec3 _pos, in float _r ) {
  return length( _pos ) - _r;
}

float box( in vec3 _pos, in vec3 _size ) {
  vec3 d = abs( _pos ) - _size;
  return min( max( d.x, max( d.y, d.z ) ), 0.0 ) + length( max( d, 0.0 ) );
}

float bar( vec2 _p, vec2 _b ) {
    vec2 d = abs( _p )- _b;
    return min( max( d.x, d.y ), 0.0 ) + length( max( d, 0.0 ) );
}

float crossBar( vec3 _p, float _b ) {
  vec3 d = vec3(
    bar( _p.xy, vec2( _b ) ),
    bar( _p.yz, vec2( _b ) ),
    bar( _p.zx, vec2( _b ) )
  );
  return min( d.x, min( d.y, d.z ) );
}

float slasher( vec3 _p, float _ratio ) {
  float phase = ( _p.x + _p.y );
  float slash = abs( 0.5 - ( phase - floor( phase ) ) ) * 2.0;
  return ( slash - _ratio ) / sqrt( 2.0 );
}

vec3 ifs( vec3 _p, vec3 _rot, vec3 _shift ) {
  vec3 p = _p;

  vec3 shift = _shift;

  for ( int i = 0; i < IFS_ITER; i ++ ) {
    float intensity = pow( 2.0, -float( i ) );

    p.y -= 0.0;

    p = abs( p ) - shift * intensity;
    shift = rotate( shift, _rot );

    if ( p.x < p.y ) { p.xy = p.yx; }
    if ( p.x < p.z ) { p.xz = p.zx; }
    if ( p.y < p.z ) { p.yz = p.zy; }
  }

  return p;
}

float word( vec3 _p, sampler2D _tex ) {
  float b = 1.0 + sin( exp( -kick * 4.0 ) * PI ) * 0.3;
  vec3 p = _p * b;
  if ( box( p, vec3( 0.5, 0.2, 0.5 ) ) < 0.0 ) {
    vec4 tex = texture2D( _tex, p.xy + 0.5 );
    vec2 distXY = vec2(
      ( 0.5 < tex.y ? -tex.x : tex.x ) / 8.0 - 3E-3,
      abs( p.z ) - 0.1
    );

    float dist = min( max( distXY.x, distXY.y ), 0.0 ) + length( max( distXY, 0.0 ) );
    return dist / b;
  } else {
    return box( p, vec3( 0.5, 0.2, 0.5 ) * 0.9 );
  }
}

float distFunc( in vec3 _pos ) {
  mtl.x = 0.0;

  float phase = saturate( t / 32.0 - 5.0 );
  float p2 = exp( -mod( t, 4.0 ) * 0.7 );
  vec3 m = vec3( 20.0 - 18.0 * phase );
  vec3 pos = _pos;
  pos.zx = rotate2D( light * exp( -snare * 2.0 ) * PI ) * pos.zx;
  pos = mod( pos - m, m * 2.0 ) - m;
  float ifsPhase = ( t - 192.0 ) / 4.0 - 0.5;
  pos = ifs(
    pos,
    mix(
      vec3( 0.39, 0.31, 0.23 ) - saturate( t / 64.0 - 1.0 ) * 0.1,
      mix(
        random( floor( max( 0.0, ifsPhase + 1.0 ) ) / 1.7 ),
        random( floor( max( 0.0, ifsPhase ) ) / 1.7 ),
        exp( -mod( t + 2.0, 4.0 ) * 1.0 )
      ).xyz * 0.1 + 0.1,
      phase
    ),
    mix(
      mix(
        vec3( 0.2, 0.5, 0.2 ),
        vec3( 1.0, 0.5, 0.0 ),
        saturate( t / 64.0 - 1.0 )
      ),
      mix(
        random( floor( max( 0.0, ifsPhase + 1.0 ) ) / 1.3 ),
        random( floor( max( 0.0, ifsPhase ) ) / 1.3 ),
        exp( -mod( t + 2.0, 4.0 ) * 1.0 )
      ).xyz * 0.7 + 1.7,
      phase
    )
  );
  float dist = max(
    box( pos, vec3( 0.1 ) ),
    -box( _pos, vec2( 1.5, 0.15 ).xyx )
  );

  // ------

  pos = _pos;
  dist = min(
    dist,
    mix(
      word( pos * vec3( -1.0, 1.0, 1.0 ), wordTexture ),
      word( pos, wordTexture2 ),
      saturate(
        320.0 < t
        ? 1.0 - length( glitch )
        : t < 192.0
        ? t / 32.0 - 4.0
        : cos( t * PI / 8.0 - 1.2 ) + 0.5
      )
    )
  );

  // ------

  float boxHeight = ( t - 128.0 ) * 0.02;
  float boxWidth = 0.4;

  pos.xz = abs( pos.xz ) - boxWidth;
  pos.y = mod( pos.y - ( 128.0 < t ? t * 5E-2 : 0.0 ), 0.04 ) - 0.02;
  dist = min(
    max(
      dist,
      -box( pos, vec3( 0.1 ) )
    ),
    box( pos, vec3( 0.05, 0.01, 0.05 ) )
  );

  if ( light < 0.5 ) {
    float distC = box( _pos, vec3( boxWidth, boxHeight, boxWidth ) );
    if ( distC < dist ) {
      dist = distC;
      mtl.x = 1.0;
    }
  }

  // ------

  return dist;
}

vec3 normalFunc( in vec3 _pos, in float _delta ) {
  vec2 d = vec2( 0.0, _delta );
  return normalize( vec3(
    distFunc( _pos + d.yxx ) - distFunc( _pos - d.yxx ),
    distFunc( _pos + d.xyx ) - distFunc( _pos - d.xyx ),
    distFunc( _pos + d.xxy ) - distFunc( _pos - d.xxy )
  ) );
}

// ------

void march() {
  dist = 0.0;

  for ( int i = 0; i < MARCH_ITER; i ++ ) {
    rayPos = rayBeg + rayDir * rayLen;
    dist = distFunc( rayPos );
    rayLen += dist * 0.8;
    if ( abs( dist ) < 1E-4 ) { break; }
    if ( 1E3 < rayLen ) { break; }
  }

  rayLenSum += rayLen;
}

void shade() {
  vec3 fogCol = mix(
    V.yyy * 0.2,
    vec3( 1.1, 1.3, 1.7 ),
    light
  ) * ( 1.0 - glitch.z );
  float decay = exp( -rayLenSum * 1E-1 );

  if ( abs( dist ) < 1E-3 ) {

    vec3 normal = normalFunc( rayPos, rayLen * 1E-3 );

    if ( 0.5 < mtl.x ) {
      light = 1.0;

      rayDir = refract( rayDir, normal, 0.8 );
      rayBeg = rayPos;
      rayLen = 1E-3;
      return;
    }

    if ( 0.5 < glitch.y ) {
      vec4 tex = texture2D( randomTexture, vec2( rayPos.y, floor( t * 2.0 ) / 4.7 ) );
      if ( tex.w < 0.5 ) {
        rayCol = vec4( tex.xyz, 0.0 );
        return;
      }
    }

    float edge = saturate( pow( length( normal - normalFunc( rayPos, 7E-3 * rayLen ) ) * 2.0, 2.0 ) );

    if ( 0.5 < glitch.z ) {
      rayCol = vec4( mix(
        V.yyy,
        V.xxx,
        edge
      ), 0.0 );
      return;
    }

    vec3 ligDir = rayDir;

    vec3 dif = saturate( dot( -normal, ligDir ) ) * V.yyy * 0.2 * ( 2.0 + light );
    vec3 edgeCol = mix(
      vec3( 1.0, 0.2, 0.5 ),
      mix(
        V.xxx,
        vec3( 0.2, 0.5, 1.0 ),
        exp( -snare )
      ),
      light
    ) * 2.0;
    rayCol.xyz += mix(
      fogCol,
      mix(
        dif,
        edgeCol,
        edge
      ),
      decay
    ) * 0.8 * rayCol.w * ( 1.0 + glitch.w * 9.0 ) - glitch.w * 2.0;
    rayCol.w *= 0.2;

    rayDir = reflect( rayDir, normal );
    rayBeg = rayPos;
    rayLen = 1E-3;

  } else {

    rayCol.xyz += fogCol * ( 1.0 - decay ) * rayCol.w;
    rayCol.w = 0.0;

  }
}

// ------

void main() {
  t = time;
  mtl = V.xxxx;
  p = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution.x;
  light = 0.0;
  glitch = V.xxxx;

  if ( 448.0 < t ) {
    t = 448.5 - exp( 896.0 - t * 2.0 ) * 0.5;
  }

  vec4 glitchr = ( 320.0 < t ) ? vec4(
    random( floor( t * 4.0 ) / 4.1 ).xy,
    random( floor( t * 2.0 ) / 6.1 ).xy
  ) : V.xxxx;
  if ( glitchr.z < -0.6 ) {
    t -= floor( mod( t, 0.5 ) * 8.0 ) / 8.0;
    p *= 0.8;
    glitch.w = 1.0;
  } else if ( glitchr.z < -0.4 ) {
    t = floor( t * 512.0 ) / 512.0;
    glitch.z = 1.0;
    p *= 1.2;
  } else if ( glitchr.z < -0.2 ) {
    t = t * 1.0 - floor( mod( t, 0.5 ) * 14.0 ) / 18.0;
    glitch.y = 1.0;
  }

  if ( glitchr.z < -0.2 ) {
    t -= 8.0 * max( 0.0, texture2D( randomTexture, floor( p.xy * vec2( 8.0, 16.0 ) + floor( t * 2.0 ) ) / 7.8 ).x - 0.7 );
  }

  kick = (
    0.6 < glitchr.x
    ? mod( t, 0.25 )
    : mod( t + ( 1.5 < mod( t, 8.0 ) ? 0.5 : 0.0 ), 2.0 ) + ( abs( t - 63.75 ) < 0.25 ? 9E9 : 0.0 )
  );
  snare = (
    glitchr.x < -0.6
    ? mod( t, 0.25 )
    : mod( t + 2.0, 4.0 ) + ( abs( t - 162.0 ) < 32.0 ? 9E9 : 0.0 )
  );

  if ( 0.0 < t ) {
    setCamera();
    initRay();

    for ( int i = 0; i < 9; i ++ ) {
      march();
      shade();
      if ( rayCol.w < 0.05 ) { break; }
    }

    gl_FragColor = vec4( rayCol.xyz - length( p ) * 0.4, 1.0 );
  }
}
