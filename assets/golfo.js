/* =========================================================
   MAGAVERSE · IL GOLFO
   La scena viva del golfo di Salerno: il sole scende in mare,
   il cielo passa dal tramonto alla notte, si accendono le luci
   della costa e le stelle. Disegnata come una locandina
   serigrafata (fasce di colore piatte + grana).

   Uso:
     <canvas data-golfo></canvas> dentro un [data-golfo-radice].
     - con un antenato [data-golfo-scroll] l'ora del giorno segue
       lo scroll (0 = tramonto, 1 = notte fonda)
     - altrimenti resta fissa su data-t (con data-t-da parte da lì
       e ci arriva in un paio di secondi)
   Espone sul radice la variabile CSS --t e le classi
   .golfo-vivo (WebGL attivo) e .golfo-notte (t > 0.5).
   Senza WebGL resta la foto di riserva; con "movimento ridotto"
   disegna un solo fotogramma.
   ========================================================= */
(function () {
  'use strict';

  var tela = document.querySelector('canvas[data-golfo]');
  if (!tela) return;
  var radice = tela.closest('[data-golfo-radice]') || tela.parentElement;
  var corsa = tela.closest('[data-golfo-scroll]');
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var num = function (v, d) { v = parseFloat(v); return isNaN(v) ? d : v; };
  var fisso = num(tela.dataset.t, 0);
  var stato = {
    t: corsa ? 0 : num(tela.dataset.tDa, fisso),
    meta: corsa ? 0 : fisso,
    tempo: 0
  };
  if (riduci) stato.t = stato.meta = corsa ? num(tela.dataset.tFermo, 0.12) : fisso;

  /* ---------- WebGL ---------- */
  var VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res;uniform float u_time;uniform float u_t;uniform float u_h;uniform float u_sx;uniform float u_velo;uniform vec2 u_par;',
    'const vec3 NOTTE=vec3(0.055,0.071,0.141);',
    'const float FASCE=11.0;',
    'float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
    'float hash1(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float noise1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(hash1(i),hash1(i+1.),f);}',
    'float fbm1(float x){return noise1(x)*.5+noise1(x*2.03+7.1)*.25+noise1(x*4.01+3.3)*.125+noise1(x*8.2+1.7)*.0625;}',
    'float cresta(float x){float a=1.-abs(2.*noise1(x)-1.);float b=1.-abs(2.*noise1(x*2.3+5.1)-1.);return a*.6+b*.25+noise1(x*6.1+2.)*.15;}',
    'vec3 rampa(vec3 a,vec3 b,vec3 c,vec3 d,vec3 e,float L){L=clamp(L,0.,1.)*4.;if(L<1.)return mix(a,b,L);if(L<2.)return mix(b,c,L-1.);if(L<3.)return mix(c,d,L-2.);return mix(d,e,L-3.);}',
    /* tre momenti: tramonto, crepuscolo, notte. Dal più scuro al più chiaro. */
    'vec3 tinta(float L,float t){',
    ' vec3 s=rampa(vec3(.118,.141,.322),vec3(.353,.227,.525),vec3(.824,.314,.431),vec3(1.,.518,.22),vec3(1.,.831,.42),L);',
    ' vec3 d=rampa(vec3(.039,.055,.149),vec3(.11,.122,.345),vec3(.333,.188,.494),vec3(.769,.278,.424),vec3(1.,.486,.275),L);',
    ' vec3 n=rampa(vec3(.022,.03,.07),vec3(.035,.058,.145),vec3(.06,.105,.25),vec3(.105,.2,.42),vec3(.19,.34,.6),L);',
    ' return mix(mix(s,d,smoothstep(0.,.5,t)),n,smoothstep(.45,1.,t));}',
    'float stelle(vec2 q,float scala,float soglia){vec2 g=floor(q*scala),f=fract(q*scala);float h=hash(g);vec2 c=vec2(hash(g+3.1),hash(g+7.7))*.6+.2;float d=length(f-c);',
    ' float tw=.62+.38*sin(u_time*(1.+3.*hash(g+1.3))+h*40.);float gr=mix(.04,.1,hash(g+9.2));return step(soglia,h)*(1.-smoothstep(0.,gr,d))*tw;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/u_res;float asp=u_res.x/u_res.y;float px=1./u_res.y;float t=u_t;',
    ' float y=uv.y-u_h;float xa=(uv.x-.5)*asp;float xq=uv.x*asp;',
    ' float sxa=(u_sx-.5)*asp+u_par.x*.012;',
    ' float sunY=mix(.19,-.17,smoothstep(0.,.62,t))+u_par.y*.004;',
    ' float sunUp=smoothstep(-.10,.06,sunY);',
    ' float r=mix(.068,.105,clamp((asp-.5)/1.3,0.,1.));',
    ' float d=length(vec2(xa-sxa,y-sunY));',
    /* promontori: la Costiera a sinistra (più alta, con i paesi), il Cilento a destra */
    ' float xl=u_sx-.13;',
    ' float tapL=1.-smoothstep(xl-.62,xl,uv.x);',
    ' float mVicino=.118*tapL*(.30+.70*cresta(xq*2.4+11.+u_par.x*.02));',
    ' float tapL2=1.-smoothstep(xl-.5,xl+.07,uv.x);',
    ' float mLontano=.175*tapL2*(.42+.58*cresta(xq*1.35+4.+u_par.x*.01));',
    ' float tapR=smoothstep(u_sx+.15,u_sx+.46,uv.x);',
    ' float mDestra=.062*tapR*(.40+.60*cresta(xq*2.9+31.));',
    ' float notte=smoothstep(.42,.9,t);',
    ' float accese=smoothstep(.36,.6,t);',
    ' vec3 col;',
    ' if(y>=0.){',
    '  float y01=clamp(y/(1.-u_h),0.,1.);',
    '  float base=.09+.60*pow(1.-y01,1.7);',
    '  float bagliore=.40*exp(-d*3.4)*mix(.22,1.,sunUp);',
    '  float dopo=.26*exp(-abs(xa-sxa)*1.8)*exp(-y01*5.5)*(1.-sunUp)*(1.-smoothstep(.6,.95,t));',
    '  float L=base+bagliore+dopo;',
    '  float onda=(noise(vec2(xa*1.5+u_time*.010,y*9.+3.))-.5)*1.2+(noise(vec2(xa*4.5-u_time*.016,y*22.))-.5)*.4;',
    '  float Lq=(floor(L*FASCE+onda)+.5)/FASCE;',
    '  col=tinta(Lq,t);',
    '  float disco=1.-smoothstep(r-px,r+px,d);',
    '  vec3 sole=mix(vec3(1.,.9,.62),vec3(1.,.42,.2),smoothstep(.2,-.06,sunY));',
    '  col=mix(col,sole,disco);',
    '  vec2 q=vec2(xa,y);',
    '  float st=1.2*stelle(q,22.,.86)+.8*stelle(q+13.7,44.,.90)+.55*stelle(q+41.3,78.,.93);',
    '  st*=notte*smoothstep(.015,.22,y01)*(1.-disco);',
    '  col+=vec3(1.,.96,.88)*st;',
    /* stella cadente, solo a notte fonda */
    '  float per=9.;float k=floor(u_time/per);float ph=fract(u_time/per)*per;float dur=.85;float pr=clamp(ph/dur,0.,1.);',
    '  vec2 dir=normalize(vec2(.92,-.38));vec2 a0=vec2(mix(-.35,.1,hash1(k+2.))*asp,mix(.22,.4,hash1(k+5.)));',
    '  vec2 testa=a0+dir*pr*.5;vec2 pq=q-testa;float lungo=clamp(dot(pq,-dir),0.,.14);float dist=length(pq+dir*lungo);',
    '  float scia=(1.-smoothstep(0.,.0035,dist))*(1.-lungo/.14)*sin(pr*3.14159)*step(ph,dur);',
    '  col+=vec3(1.,.95,.85)*scia*smoothstep(.8,.98,t);',
    '  float bl=1.-smoothstep(mLontano-px,mLontano+px,y);',
    '  col=mix(col,mix(tinta(.15,t),tinta(.56,t),.2),bl);',
    '  float br=1.-smoothstep(mDestra-px,mDestra+px,y);',
    '  col=mix(col,mix(tinta(.1,t),tinta(.5,t),.12),br);',
    '  float bv=1.-smoothstep(mVicino-px,mVicino+px,y);',
    '  col=mix(col,tinta(.045,t),bv);',
    /* le luci dei paesi sulla costa */
    '  float cx=xq*120.;float id=floor(cx);float fx=fract(cx);',
    '  float paese=smoothstep(.36,.58,noise1(id*.11+2.))*step(.3,hash1(id+.5));',
    '  float lyy=(.006+.72*hash1(id+9.))*mVicino;float lxx=.25+.5*hash1(id+4.);',
    '  vec2 ld=vec2((fx-lxx)/120.,y-lyy);',
    '  float luce=(1.-smoothstep(0.,2.6*px,length(ld)))*paese*step(.012,mVicino);',
    '  luce*=.65+.35*sin(u_time*(1.2+2.6*hash1(id+2.))+id);',
    '  col+=vec3(1.,.78,.42)*luce*accese;',
    ' }else{',
    '  float dy=-y;float prof=clamp(dy/u_h,0.,1.);',
    '  float su=xa/pow(dy+.012,.72);float sv=log(dy+.006);',
    '  float w=noise(vec2(su*.85+2.,sv*8.5+u_time*.26));',
    '  float w2=noise(vec2(su*2.1-5.,sv*17.-u_time*.38));',
    '  float rip=mix(.5,w*.62+w2*.38,smoothstep(.003,.02,dy));',
    '  float L=mix(.44,.06,pow(prof,.5));',
    '  L+=(rip-.5)*.2*(1.-prof*.6);',
    '  float larg=.016+dy*.34;float colonna=exp(-pow((xa-sxa)/larg,2.));',
    '  float lampo=smoothstep(.5,.62,rip);',
    '  float forza=mix(.3*(1.-smoothstep(.6,.95,t)),1.,sunUp);',
    '  L+=colonna*lampo*.52*forza*(1.-prof*.45);',
    '  float Lq=(floor(L*FASCE+(rip-.5)*1.5)+.5)/FASCE;',
    '  col=tinta(Lq*.94,t)*vec3(.92,.95,1.);',
    /* riflessi delle luci della costa */
    '  float cx=xq*120.;float id=floor(cx);float fx=fract(cx);',
    '  float paese=smoothstep(.36,.58,noise1(id*.11+2.))*step(.3,hash1(id+.5))*step(.012,mVicino);',
    '  float lxx=.25+.5*hash1(id+4.);',
    '  float rif=exp(-abs(fx-lxx)*9.)*exp(-dy*38.)*paese*(.5+.5*lampo);',
    '  col+=vec3(1.,.72,.38)*rif*accese*.55;',
    ' }',
    /* velo scuro in basso, per leggere i testi e fondersi con la pagina */
    ' float velo=(1.-smoothstep(0.,.46,uv.y))*mix(.66,1.,smoothstep(.55,1.,t))*u_velo;',
    ' col=mix(col,NOTTE,velo);',
    ' vec2 vg=uv-.5;col*=1.-dot(vg,vg)*.22;',
    ' float gr=hash(gl_FragCoord.xy*.7+floor(u_time*12.)*17.)-.5;',
    ' col+=gr*.05;col*=.965+.07*noise(gl_FragCoord.xy*.4);',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  var gl = null, prog = null, uni = {};
  function avviaGL() {
    try {
      gl = tela.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }) ||
           tela.getContext('experimental-webgl');
    } catch (e) { gl = null; }
    if (!gl) return false;
    function sh(tipo, src) {
      var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (window.console) console.warn('golfo:', gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) { gl = null; return false; }
    prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['u_res', 'u_time', 'u_t', 'u_h', 'u_sx', 'u_velo', 'u_par'].forEach(function (n) { uni[n] = gl.getUniformLocation(prog, n); });
    return true;
  }

  var par = { x: 0, y: 0, mx: 0, my: 0 };
  function misura() {
    var w = tela.clientWidth, h = tela.clientHeight;
    if (!w || !h) return false;
    var scala = Math.min(window.devicePixelRatio || 1, 1.5);
    var tetto = 1.5e6;
    if (w * h * scala * scala > tetto) scala = Math.sqrt(tetto / (w * h));
    var W = Math.round(w * scala), H = Math.round(h * scala);
    if (tela.width !== W || tela.height !== H) { tela.width = W; tela.height = H; }
    return true;
  }
  function disegna() {
    if (!gl || !misura()) return;
    var largo = tela.width / tela.height > 1;
    gl.viewport(0, 0, tela.width, tela.height);
    gl.uniform2f(uni.u_res, tela.width, tela.height);
    gl.uniform1f(uni.u_time, stato.tempo);
    gl.uniform1f(uni.u_t, stato.t);
    gl.uniform1f(uni.u_h, num(largo ? tela.dataset.hLargo : tela.dataset.h, num(tela.dataset.h, largo ? 0.52 : 0.5)));
    gl.uniform1f(uni.u_sx, num(largo ? tela.dataset.sxLargo : tela.dataset.sx, num(tela.dataset.sx, largo ? 0.66 : 0.74)));
    gl.uniform1f(uni.u_velo, num(tela.dataset.velo, 1));
    gl.uniform2f(uni.u_par, par.x, par.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ---------- ora del giorno ---------- */
  var ultimoT = -1;
  function applica() {
    if (Math.abs(stato.t - ultimoT) < 0.002) return;
    ultimoT = stato.t;
    radice.style.setProperty('--t', stato.t.toFixed(3));
    radice.classList.toggle('golfo-notte', stato.t > 0.5);
    radice.classList.toggle('luci-accese', stato.t > 0.46);
    radice.classList.toggle('golfo-partito', stato.t > 0.04);
  }
  function leggiScroll() {
    if (!corsa) return;
    var r = corsa.getBoundingClientRect();
    var tratto = r.height - (radice.offsetHeight || window.innerHeight);
    stato.meta = tratto > 40 ? Math.min(1, Math.max(0, -r.top / tratto)) : stato.meta;
  }

  var raf = 0, ultimo = 0, inVista = true;
  function giro(ora) {
    raf = 0;
    var dt = ultimo ? Math.min(0.05, (ora - ultimo) / 1000) : 0.016;
    ultimo = ora;
    stato.tempo += dt;
    var diff = stato.meta - stato.t;
    stato.t += diff * Math.min(1, dt * (corsa ? 6 : 1.4));
    if (Math.abs(diff) < 0.0006) stato.t = stato.meta;
    par.x += (par.mx - par.x) * Math.min(1, dt * 3);
    par.y += (par.my - par.y) * Math.min(1, dt * 3);
    applica();
    disegna();
    if (inVista && !document.hidden) raf = window.requestAnimationFrame(giro);
  }
  function parti() { if (!raf && !riduci) { ultimo = 0; raf = window.requestAnimationFrame(giro); } }

  var haGL = avviaGL();
  radice.classList.add(haGL ? 'golfo-vivo' : 'golfo-foto-attiva');
  leggiScroll();
  if (riduci) { stato.t = stato.meta; }
  applica();
  disegna();

  if (riduci) {
    window.addEventListener('resize', function () { disegna(); });
    return;
  }

  window.addEventListener('scroll', function () { leggiScroll(); parti(); }, { passive: true });
  window.addEventListener('resize', function () { leggiScroll(); parti(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) parti(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (v) { inVista = v[0].isIntersecting; if (inVista) parti(); }, { rootMargin: '80px' }).observe(radice);
  }
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      par.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      par.my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  tela.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; radice.classList.remove('golfo-vivo'); radice.classList.add('golfo-foto-attiva'); });
  tela.addEventListener('webglcontextrestored', function () { if (avviaGL()) { radice.classList.add('golfo-vivo'); radice.classList.remove('golfo-foto-attiva'); parti(); } });
  parti();

  /* per i test: congela l'ora e il tempo */
  window.__golfo = { stato: stato, disegna: function () { applica(); disegna(); } };
})();
