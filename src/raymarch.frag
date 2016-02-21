#define saturate(i) clamp(i,0.,1.)

uniform float u_time;
uniform vec2 u_resolution;

uniform sampler2D u_wordTexture;
uniform sampler2D u_wordTexture2;
uniform sampler2D u_texture;

// ------

vec2 p;
float timeKeeper;
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
  return texture2D( u_texture, _p * vec2( 0.79, 0.73 ) ) * 2.0 - 1.0;
}

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

// ------

void setCamera() {
  vec3 rot = vec3( 0.0 );

  float th = timeKeeper * P / 8.0;
  camPos = vec3( sin( th ), 0.0, cos( th ) ) * (
    1.0
    + 1.0 * exp( -max( 0.0, timeKeeper ) )
    - 1.0 * exp( -max( 0.0, timeKeeper - 64.0 ) )
    + 1.3 * exp( -max( 0.0, timeKeeper - 128.0 ) )
    - 0.3 * exp( -max( 0.0, timeKeeper - 192.0 ) )
  );
  camTar = vec3( 0.0, 0.0, 0.0 );
  camDir = normalize( camTar - camPos );
  camSid = normalize( cross( camDir, V.xyx ) );
  camTop = cross( camSid, camDir );
  th = sin( timeKeeper * 0.3 ) * 0.2;
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

float box( vec3 _pos, vec3 _size ) {
  vec3 dist = abs( _pos ) - _size;
  return min( max( dist.x, max( dist.y, dist.z ) ), 0.0 ) + length( max( dist, 0.0 ) );
}

float slasher( vec3 _p, float _ratio ) { // TODO
  float phase = ( _p.x + _p.y );
  float slash = abs( 0.5 - ( phase - floor( phase ) ) ) * 2.0;
  return ( slash - _ratio ) / sqrt( 2.0 );
}

vec3 ifs( vec3 _p, vec3 _rot, vec3 _shift ) {
  vec3 pos = _p;

  vec3 shift = _shift;

  for ( int i = 0; i < 5; i ++ ) {
    float intensity = pow( 2.0, -float( i ) );

    pos.y -= 0.0;

    pos = abs( pos ) - shift * intensity;

    shift.yz = rotate2D( _rot.x ) * shift.yz;
    shift.zx = rotate2D( _rot.y ) * shift.zx;
    shift.xy = rotate2D( _rot.z ) * shift.xy;

    if ( pos.x < pos.y ) { pos.xy = pos.yx; }
    if ( pos.x < pos.z ) { pos.xz = pos.zx; }
    if ( pos.y < pos.z ) { pos.yz = pos.zy; }
  }

  return pos;
}

float word( vec3 _p, sampler2D _tex ) {
  float beat = 1.0 + sin( exp( -kick * 4.0 ) * P ) * 0.3;
  vec3 pos = _p * beat;
  if ( box( pos, vec3( 0.5, 0.2, 0.5 ) ) < 0.0 ) {
    vec4 tex = texture2D( _tex, 0.5 - pos.xy );
    vec2 distXY = vec2(
      ( 0.5 < tex.y ? -tex.x : tex.x ) / 8.0 - 3E-3,
      abs( pos.z ) - 0.1
    );

    float dist = min( max( distXY.x, distXY.y ), 0.0 ) + length( max( distXY, 0.0 ) );
    return dist / beat;
  } else {
    return box( pos, vec3( 0.5, 0.2, 0.5 ) * 0.9 );
  }
}

float distFunc( vec3 _pos ) {
  mtl.x = 0.0;

  float phase = saturate( timeKeeper / 32.0 - 5.0 );
  vec3 modder = vec3( 20.0 - 18.0 * phase );
  vec3 pos = _pos;
  pos.zx = rotate2D( light * exp( -snare * 2.0 ) * P ) * pos.zx;
  pos = mod( pos - modder, modder * 2.0 ) - modder;
  float ifsPhase = ( timeKeeper - 192.0 ) / 4.0 - 0.5;
  pos = ifs(
    pos,
    mix(
      vec3( 0.39, 0.31, 0.23 ) - saturate( timeKeeper / 64.0 - 1.0 ) * 0.1,
      mix(
        random( floor( max( 0.0, ifsPhase + 1.0 ) ) / 1.7 ),
        random( floor( max( 0.0, ifsPhase ) ) / 1.7 ),
        exp( -mod( timeKeeper + 2.0, 4.0 ) * 1.0 )
      ).xyz * 0.1 + 0.1,
      phase
    ),
    mix(
      mix(
        vec3( 0.2, 0.5, 0.2 ),
        vec3( 1.0, 0.5, 0.0 ),
        saturate( timeKeeper / 64.0 - 1.0 )
      ),
      mix(
        random( floor( max( 0.0, ifsPhase + 1.0 ) ) / 1.3 ),
        random( floor( max( 0.0, ifsPhase ) ) / 1.3 ),
        exp( -mod( timeKeeper + 2.0, 4.0 ) * 1.0 )
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
      word( pos, u_wordTexture ),
      word( pos * vec3( -1.0, 1.0, 1.0 ), u_wordTexture2 ),
      saturate(
        320.0 < timeKeeper
        ? 1.0 - length( glitch )
        : timeKeeper < 192.0
        ? timeKeeper / 32.0 - 4.0
        : cos( timeKeeper * P / 8.0 - 1.2 ) + 0.5
      )
    )
  );

  // ------

  float boxHeight = ( timeKeeper - 128.0 ) * 0.02;
  float boxWidth = 0.4;

  pos.xz = abs( pos.xz ) - boxWidth;
  pos.y = mod( pos.y - ( 128.0 < timeKeeper ? timeKeeper * 5E-2 : 0.0 ), 0.04 ) - 0.02;
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

vec3 normalFunc( vec3 _pos, float _delta ) {
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

  for ( int i = 0; i < 99; i ++ ) {
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
      vec4 tex = texture2D( u_texture, vec2( rayPos.y, floor( u_time * 2.0 ) / 4.7 ) );
      if ( tex.w < 0.5 ) {
        rayCol = vec4( tex.xyz, 0.0 );
        return;
      }
    }

    float edge = saturate( pow( length( normal - normalFunc( rayPos, 4E-3 * rayLen ) ) * 2.0, 2.0 ) );

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
  timeKeeper = u_time + 0.12;
  mtl = V.xxxx;
  p = ( gl_FragCoord.xy * 2.0 - u_resolution ) / u_resolution.x;
  light = 0.0;
  glitch = V.xxxx;

  if ( 448.0 < timeKeeper ) {
    timeKeeper = 448.5 - exp( 896.0 - timeKeeper * 2.0 ) * 0.5;
  }

  if ( timeKeeper < 0.0 ) {
    gl_FragColor = vec4(
      V.yyy * saturate( ( exp( -mod( timeKeeper, 1.0 ) ) * 0.1 - length( p ) ) * 4E2 ),
      1.0
    );
  } else {
    vec4 glitchr = ( 320.0 < timeKeeper ) ? vec4(
      random( floor( timeKeeper * 4.0 ) / 5.74 ).xy,
      random( floor( timeKeeper * 2.0 ) / 6.74 ).xy
    ) : V.xxxx;
    if ( glitchr.z < -0.6 ) {
      timeKeeper -= floor( mod( timeKeeper, 0.5 ) * 8.0 ) / 8.0;
      p *= 0.8;
      glitch.w = 1.0;
      timeKeeper -= 8.0 * max( 0.0, texture2D( u_texture, floor( p.xy * vec2( 4.0, 16.0 ) + floor( timeKeeper * 2.0 ) ) / 7.8 ).x - 0.7 );
    } else if ( glitchr.z < -0.4 ) {
      timeKeeper = floor( timeKeeper * 512.0 ) / 512.0;
      glitch.z = 1.0;
      p *= 1.2;
    } else if ( glitchr.z < -0.2 ) {
      timeKeeper = timeKeeper * 1.0 - floor( mod( timeKeeper, 0.5 ) * 14.0 ) / 18.0;
      glitch.y = 1.0;
    }

    kick = (
      0.6 < glitchr.x
      ? mod( timeKeeper, 0.25 )
      : mod( timeKeeper + ( 1.5 < mod( timeKeeper, 8.0 ) ? 0.5 : 0.0 ), 2.0 ) + ( abs( timeKeeper - 63.75 ) < 0.25 ? 9E9 : 0.0 )
    );
    snare = (
      glitchr.x < -0.6
      ? mod( timeKeeper, 0.25 )
      : mod( timeKeeper + 2.0, 4.0 ) + ( abs( timeKeeper - 162.0 ) < 32.0 ? 9E9 : 0.0 )
    );

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
