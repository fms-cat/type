if(!confirm('proceed?')){
throw'exit!';
}



var p;
function e(){
p=p^(p<<13)||1;
p=p^(p>>>17);
p=p^(p<<5);
return p/Math.pow(2,32)+.5;
}

var q=2048;
var myDistSizeSq=q*q;
C.style.width=screen.width+'px';
C.style.height=screen.height+'px';



var r=C.getContext('webgl')||C.getContext('experimental-webgl');



function f(a){

var s=r.createShader(r.VERTEX_SHADER);
r.shaderSource(s,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
r.compileShader(s);

var t=r.createShader(r.FRAGMENT_SHADER);
r.shaderSource(t,"precision highp float;\n#define P 3.14159265\n#define F float\n#define D vec2\n#define T vec3\n#define Q vec4\n#define V D(0.,1.)\n"+a);
r.compileShader(t);

var y=r.createProgram();
r.attachShader(y,s);
r.attachShader(y,t);
r.linkProgram(y);
r.getProgramParameter(y,r.LINK_STATUS);
y.l={};
return y;

}

function g(){

var v=r.createTexture();
	r.bindTexture(r.TEXTURE_2D,v);
r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR);
r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR);
r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.REPEAT);
r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.REPEAT);
return v;

}

function h(a,b,c,d){

	r.bindTexture(r.TEXTURE_2D,a);
r.texImage2D(r.TEXTURE_2D,0,r.RGBA,b,c,0,r.RGBA,r.UNSIGNED_BYTE,new Uint8Array(d));

}

var z;
function l(a){

if(y.l[a]){
z=y.l[a];
}else{
z=r.getUniformLocation(y,a);
y.l[a]=z;
}
return z;

}

var x=r.createBuffer();
r.bindBuffer(r.ARRAY_BUFFER,x);
r.bufferData(r.ARRAY_BUFFER,new Float32Array([1,-1,1,1,-1,-1,-1,1]),r.STATIC_DRAW);

var y;
function m(a){

y=a;
r.useProgram(y);

var z=r.getAttribLocation(y,'p');

r.enableVertexAttribArray(z);
r.vertexAttribPointer(z,2,r.FLOAT,false,0,0);

}

function n(a,b,c){

r.activeTexture(r.TEXTURE0+c);
r.bindTexture(r.TEXTURE_2D,b);
r.uniform1i(a,c);

}



var J=new Uint8Array(myDistSizeSq*4);
var D=g();
h(D,q,q,(function(){
for(i=0;i<myDistSizeSq*4;i++){
J[i]=e()*256;
}
return J;
})());



if(confirm('audio?')){

var E=new Float32Array(7000000);
var F=new Float32Array(7000000);
m(f("#define pitch(i,j)96.0*pow( 2.0,( i*5.0+mod( i,2.0)*2.0+( 3.0<i?6.0:0.0)+j)/12.0)\n#define saturate(i)clamp(i,-1.,1.)\nuniform F i;uniform sampler2D randomTexture;D f(F f){return texture2D(randomTexture,f*D(.79,.73)).xy*2.-1.;}void main(){F m=(i*4.1943e+06+floor(gl_FragCoord.x)+floor(gl_FragCoord.y)*2048.)/44100.*175./60.-8.;D e=V.xx;F r=floor(m/8.);if(m<0.||abs(m-63.75)<.25){if(mod(m,1.)<.1)e+=sin(m*4096./(mod(m,4.)<1.?1.:2.))*.5;}else{if(448.<m)m=452.-exp(448.-m)*4.,m-=floor((m-448.)*11.9)/14.;Q s=320.<m?Q(f(floor(m*4.)/5.74),f(floor(m*2.)/6.74)):V.xxxx;if(s.z<-.6)m-=floor(mod(m,.5)*8.)/8.;else if(s.z<-.4)m=floor(m*512.)/512.;else if(s.z<-.2)m=m-floor(mod(m,.5)*14.)/18.;F p=.6<s.x?mod(m,.25):mod(m+(1.5<mod(m,8.)?.5:0.),2.);e+=sin(exp(-p*24.)*99.-m*96.)*.6;F a=s.x<-.6?mod(m,.25):mod(m+2.,4.)+(abs(m-162.)<32.?9e+09:0.);e+=saturate((f(m*40.)+sin(m*32.*D(26.1,25.9)-exp(-a*320.)*20.)*2.)*2.*exp(-a*8.))*.25;F t=mod(m,.5-(192.<m?.25:0.));e+=f(m*40.)*exp(-t*42.)*saturate(a*p)*.4;F x=mod(m,.25);if(32.<m)e+=sin(exp(-x*300.)*f(m))*.8;if(abs(m-192.)<128.){F v=clamp(m/32.-5.,0.,1.);for(int z=0;z<5;z++){F g=F(z);for(int j=0;j<5;j++){D y=(4.+f(g)*.1+f(F(j))*.03)*pitch(g,0.);e+=sin(m*y+sin(m*4.*y+sin(m*12.*y))*v*.2)*.02*(2.-v)*(j==0?1.:v)*saturate(a*p);if(m<160.){break;}}}}if(128.<m){D y=D(8.01,7.99)*pitch(mod(floor(m*4.),6.),floor(f(floor(m*4.)/7.3).x*3.)*12.);e+=sin(m*y+sin(m*y)*exp(-x*12.))*.1*exp(-x*7.)*saturate(a*p);}}gl_FragColor=Q(e*.5+.5,0.,1.);}"));

for(i=0;i<2;i++){

r.uniform1f(l('i'),i);
n(l('D'),D,0);

r.drawArrays(r.TRIANGLE_STRIP,0,4);
r.flush();
r.readPixels(0,0,q,q,r.RGBA,r.UNSIGNED_BYTE,J);

for(j=0;j<myDistSizeSq;j++){
if(i*myDistSizeSq+j<7000000){
E[i*myDistSizeSq+j]=J[j*4]/128-1;
F[i*myDistSizeSq+j]=J[j*4+1]/128-1;
}
}

}

arrayToWav(
[E,F],
{download:'type.wav'}
);

E=null;
F=null;

}



m(f("#define saturate(i)clamp(i,0.,1.)\nuniform bool v;uniform sampler2D t;bool f(F y,bool f){return y<0.==f;}F f(Q i){return(i.y<.5?-1.:1.)*(v?i.x-.5/255.:100.);}void main(){F y=2048.;D g=gl_FragCoord.xy,x=V.yx;F b=y,r=gl_FragCoord.x;if(v)x=V.xy,b=y,r=gl_FragCoord.y;F i=f(texture2D(t,g/y));bool s=f(i,true);i=abs(i);for(int e=1;e<256;e++){F m=F(e),l=(m-.5)/255.;if(i<l){break;}for(int u=-1;u<2;u+=2){F o=F(u);D d=g+o*m*x;if(0.<=d.x&&d.x<y&&0.<=d.y&&d.y<y){F a=f(texture2D(t,d/y));i=min(i,length(D(l,f(a,s)?a:0.)));}}}gl_FragColor=Q(i,s?0.:1.,0.,1.);}"));

var G=document.createElement('canvas');
G.width=q;
G.height=q;
var H=G.getContext('2d');

var I=g();
var J=new Uint8Array(myDistSizeSq*4);
var K=g();
var wordTextures=(function(){
var L=[
'///////////////',
'FMS_Cat',
'Greetings:',
'ASD',
'Ctrl-Alt-Test',
'doxas',
'gyabo',
'MetroGirl',
'nikq::club',
'orange',
'primitive',
'quite',
'Radium Software',
'rgba',
'RTX1911',
'SystemK',
'xplsv',
'[ Type ]'
];
for(i=0;i<32;i++){
var M='';
for(j=0;j<8;j++){
M+=String.fromCharCode(Math.pow(e(),4)*65536);
}
L.push(M);
}
return L;
})().map(function(a){
H.fillStyle='#000';
H.fillRect(0,0,q,q);

H.fillStyle='#fff';
H.font='500 200px Arial';
H.textAlign='center';
H.textBaseline='middle';
H.fillText(a,q/2,q/2);



h(I,q,q,H.getImageData(0,0,q,q).data);
var N=g();



r.uniform1i(l('v'),0);
n(l('t'),I,0);

r.drawArrays(r.TRIANGLE_STRIP,0,4);
r.readPixels(0,0,q,q,r.RGBA,r.UNSIGNED_BYTE,J);
h(K,q,q,J);



r.uniform1i(l('v'),1);
n(l('t'),K,0);

r.drawArrays(r.TRIANGLE_STRIP,0,4);
r.readPixels(0,0,q,q,r.RGBA,r.UNSIGNED_BYTE,J);
h(N,q,q,J);

r.flush();



return N;
});



C.width=1280;
C.height=720;
r.viewport(0,0,C.width,C.height);
r.bindFramebuffer(r.FRAMEBUFFER,null);
m(f("#define saturate(i)clamp(i,0.,1.)\nuniform F u_time;uniform D u_resolution;uniform sampler2D u_wordTexture,u_wordTexture2,u_texture;D v;F m,f,y,x;T i,e,z,r,u,s,n;F w,l;T a;Q c;F t;Q b,k;Q p(F m){return texture2D(u_texture,m*D(.79,.73))*2.-1.;}mat2 d(F m){return mat2(cos(m),sin(m),-sin(m),cos(m));}void d(){T x=T(0.);F v=m*P/8.;i=T(sin(v),0.,cos(v))*(1.+exp(-max(0.,m))-exp(-max(0.,m-64.))+1.3*exp(-max(0.,m-128.))-.3*exp(-max(0.,m-192.)));e=T(0.,0.,0.);z=normalize(e-i);u=normalize(cross(z,V.xyx));r=cross(u,z);v=sin(m*.3)*.2;u=cos(v)*u+sin(v)*r;r=cross(u,z);}void p(){s=normalize(u*v.x+r*v.y+z*(1.-length(v.xy)*.3)),n=i,w=.001,l=0.,c=V.xxxy;}F d(T m,T x){T v=abs(m)-x;return min(max(v.x,max(v.y,v.z)),0.)+length(max(v,0.));}F p(T m,F x){F v=m.x+m.y,f=abs(.5-(v-floor(v)))*2.;return(f-x)/sqrt(2.);}T d(T m,T v,T x){T f=m,c=x;for(int i=0;i<5;i++){F w=pow(2.,-F(i));f.y-=0.;f=abs(f)-c*w;c.yz=d(v.x)*c.yz;c.zx=d(v.y)*c.zx;c.xy=d(v.z)*c.xy;if(f.x<f.y)f.xy=f.yx;if(f.x<f.z)f.xz=f.zx;if(f.y<f.z)f.yz=f.zy;}return f;}F h(T m,sampler2D v){F x=1.+sin(exp(-f*4.)*P)*.3;T c=m*x;if(d(c,T(.5,.2,.5))<0.){Q k=texture2D(v,.5-c.xy);D u=D((.5<k.y?-k.x:k.x)/8.-.003,abs(c.z)-.1);F w=min(max(u.x,u.y),0.)+length(max(u,0.));return w/x;}else return d(c,T(.5,.2,.5)*.9);}F h(T v){b.x=0.;F z=saturate(m/32.-5.);T w=T(20.-18.*z),f=v;f.zx=d(x*exp(-y*2.)*P)*f.zx;f=mod(f-w,w*2.)-w;F u=(m-192.)/4.-.5;f=d(f,mix(T(.39,.31,.23)-saturate(m/64.-1.)*.1,mix(p(floor(max(0.,u+1.))/1.7),p(floor(max(0.,u))/1.7),exp(-mod(m+2.,4.))).xyz*.1+.1,z),mix(mix(T(.2,.5,.2),T(1.,.5,0.),saturate(m/64.-1.)),mix(p(floor(max(0.,u+1.))/1.3),p(floor(max(0.,u))/1.3),exp(-mod(m+2.,4.))).xyz*.7+1.7,z));F i=max(d(f,T(.1)),-d(v,D(1.5,.15).xyx));f=v;i=min(i,mix(h(f,u_wordTexture),h(f*T(-1.,1.,1.),u_wordTexture2),saturate(320.<m?1.-length(k):m<192.?m/32.-4.:cos(m*P/8.-1.2)+.5)));F c=(m-128.)*.02,e=.4;f.xz=abs(f.xz)-e;f.y=mod(f.y-(128.<m?m*.05:0.),.04)-.02;i=min(max(i,-d(f,T(.1))),d(f,T(.05,.01,.05)));if(x<.5){F a=d(v,T(e,c,e));if(a<i)i=a,b.x=1.;}return i;}T o(T m,F v){D f=D(0.,v);return normalize(T(h(m+f.yxx)-h(m-f.yxx),h(m+f.xyx)-h(m-f.xyx),h(m+f.xxy)-h(m-f.xxy)));}void h(){t=0.;for(int f=0;f<99;f++){a=n+s*w;t=h(a);w+=t*.8;if(abs(t)<.0001){break;}if(1000.<w){break;}}l+=w;}void o(){T m=mix(V.yyy*.2,T(1.1,1.3,1.7),x)*(1.-k.z);F v=exp(-l*.1);if(abs(t)<.001){T f=o(a,w*.001);if(.5<b.x){x=1.;s=refract(s,f,.8);n=a;w=.001;return;}if(.5<k.y){Q i=texture2D(u_texture,D(a.y,floor(u_time*2.)/4.7));if(i.w<.5){c=Q(i.xyz,0.);return;}}F z=saturate(pow(length(f-o(a,.004*w))*2.,2.));if(.5<k.z){c=Q(mix(V.yyy,V.xxx,z),0.);return;}T u=s,i=saturate(dot(-f,u))*V.yyy*.2*(2.+x),e=mix(T(1.,.2,.5),mix(V.xxx,T(.2,.5,1.),exp(-y)),x)*2.;c.xyz+=mix(m,mix(i,e,z),v)*.8*c.w*(1.+k.w*9.)-k.w*2.;c.w*=.2;s=reflect(s,f);n=a;w=.001;}else c.xyz+=m*(1.-v)*c.w,c.w=0.;}void main(){m=u_time+.12;b=V.xxxx;v=(gl_FragCoord.xy*2.-u_resolution)/u_resolution.x;x=0.;k=V.xxxx;if(448.<m)m=448.5-exp(896.-m*2.)*.5;if(m<0.)gl_FragColor=Q(V.yyy*saturate((exp(-mod(m,1.))*.1-length(v))*400.),1.);else{Q i=320.<m?Q(p(floor(m*4.)/5.74).xy,p(floor(m*2.)/6.74).xy):V.xxxx;if(i.z<-.6)m-=floor(mod(m,.5)*8.)/8.,v*=.8,k.w=1.,m-=8.*max(0.,texture2D(u_texture,floor(v.xy*D(4.,16.)+floor(m*2.))/7.8).x-.7);else if(i.z<-.4)m=floor(m*512.)/512.,k.z=1.,v*=1.2;else if(i.z<-.2)m=m-floor(mod(m,.5)*14.)/18.,k.y=1.;f=.6<i.x?mod(m,.25):mod(m+(1.5<mod(m,8.)?.5:0.),2.)+(abs(m-63.75)<.25?9e+09:0.);y=i.x<-.6?mod(m,.25):mod(m+2.,4.)+(abs(m-162.)<32.?9e+09:0.);d();p();for(int w=0;w<9;w++){h();o();if(c.w<.05){break;}}gl_FragColor=Q(c.xyz-length(v)*.4,1.);}}"));

var O=false;
var P=prompt('from?',0);
console.log(P);
if(P==='p'){
O=true;
}else{
P=parseInt(P);
if(isNaN(P)){
alert('nay');
throw'nay';
}
}
var Q;

function o(){

if(O){
P=parseInt(prompt('which?',P));
if(isNaN(P)){
alert('nay');
throw'nay';
}
}

Q=P/60*175/60-8;

r.uniform1f(l('u_time'),Q);
r.uniform2fv(l('u_resolution'),[C.width,C.height]);
n(l('u_texture'),D,0);
n(l('u_wordTexture'),wordTextures[
Q<192
?0
:320<Q
?18+Math.floor(Q*2)%32
:Math.min(Math.floor((Q-176)/16)*2,17)
],1);
n(l('u_wordTexture2'),wordTextures[
Q<192
?1
:Math.min(Math.floor((Q-184)/16)*2+1,17)
],2);

r.drawArrays(r.TRIANGLE_STRIP,0,4);
r.flush();

if(456<Q){
alert('🎉itfinallydone🎉');
}else{
var R=C.toDataURL();
var S=document.createElement('a');
var T='type'+('0000'+P).slice(-5)+'.png';
S.download=T;
S.href=R;
S.click();
S=null;
R='';

if(!O){
requestAnimationFrame(o);
}
}

P++;

}
o();

if(O){
C.onclick=function(){
o();
};
}
