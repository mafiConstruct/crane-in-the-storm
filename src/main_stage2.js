

// ---------- Grúa en la tormenta: prototipo 1 (físico propio, sin librerías) ----------
const W=960,H=540,GY=482,RAIL=58;
const cv=document.getElementById('c');
const G=950, SUB=3, DT=1/60/SUB;
let seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
const KINDS={
 tire:{r:26,m:2.2,col:'#222',grip:10000,bounce:.45},
 barrel:{r:22,m:3,col:'#8a4b2a',grip:8000,bounce:.2},
 ball:{r:17,m:2.4,col:'#9aa4ad',grip:10000,bounce:.35},
 gear:{r:20,m:1.6,col:'#6f7b86',grip:12000,bounce:.25},
 heavy:{r:36,m:8,col:'#5a3b2e',grip:4600,bounce:.12}
};
const rects=[ // estáticos: contenedor a la derecha
 {x:262,y:GY-46,w:10,h:46},{x:700,y:GY-100,w:10,h:100},{x:896,y:GY-100,w:10,h:100}
];
let objs,rope,mag,trolley,L,wind,gustT,state,input,held,score,flash,shake,particles,msg,msgT,t,drops,firstLift;
const N=11;
function reset(){
 seed=7;t=0;objs=[];particles=[];score=0;shake=0;flash=0;drops=0;firstLift=false;held=null;msg='';msgT=0;
 trolley={x:300,vx:0,z:0};L=200;wind=0;gustT=4;
 rope=[];for(let i=0;i<=N;i++)rope.push({x:300,y:RAIL+i*(L/N),px:300,py:RAIL+i*(L/N),im:i==N?1/3.2:1/.35});
 mag=rope[N];mag.r=22;mag.on=false;mag.z=0;
 // montón inestable a la izquierda
 const ks=['tire','barrel','ball','gear','tire','barrel','heavy','ball','tire','gear','barrel','ball'];
 let k=0;
 for(let row=0;row<4;row++){for(let c=0;c<4-row;c++){
   const kind=ks[k++%ks.length];const d=KINDS[kind];
   add(kind,42+c*60+row*30+(rnd()-.5)*6,GY-d.r-row*50-2);}}
 // piezas sueltas para empezar con algo fácil
 add('ball',420,GY-17,0);add('barrel',520,GY-22,-70);add('tire',580,GY-26,70);add('ball',450,GY-17,-70);add('tire',640,GY-26,0);add('barrel',480,GY-22,70);
}
function add(kind,x,y,z=0){const d=KINDS[kind];objs.push({z,kind,x,y,vx:0,vy:0,r:d.r,m:d.m,im:1/d.m,ang:rnd()*6,av:0,held:false,inside:false,hit:0})}
reset();
input={l:0,r:0,u:0,d:0,f:0,b:0};
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(k.startsWith('arrow'))e.preventDefault();
 if(k=='arrowleft'||k=='a')input.l=1;
 if(k=='arrowright'||k=='d')input.r=1;
 if(k=='arrowup'||k=='w')input.u=1;
 if(k=='arrowdown'||k=='s')input.d=1;
 if(k=='q')input.f=1;if(k=='e')input.b=1;
 if((k==' ')&&!e.repeat){toggle();e.preventDefault()}
 if(k=='r')reset();
 initAudio();
});
addEventListener('keyup',e=>{
 const k=e.key.toLowerCase();
 if(k=='arrowleft'||k=='a')input.l=0;
 if(k=='arrowright'||k=='d')input.r=0;
 if(k=='arrowup'||k=='w')input.u=0;
 if(k=='arrowdown'||k=='s')input.d=0;
 if(k=='q')input.f=0;if(k=='e')input.b=0;
});
// ratón/táctil: arrastrar mueve el carro, doble toque = imán
let ptr=null;
cv.addEventListener('pointerdown',e=>{initAudio();ptr={x:e.clientX,y:e.clientY,t:performance.now()}});
cv.addEventListener('pointermove',e=>{if(!ptr)return;const r=cv.getBoundingClientRect();const dx=(e.clientX-ptr.x),dy=(e.clientY-ptr.y);
 input.r=dx>25?1:0;input.l=dx<-25?1:0;input.d=dy>25?1:0;input.u=dy<-25?1:0});
cv.addEventListener('pointerup',e=>{if(ptr&&performance.now()-ptr.t<220&&Math.hypot(e.clientX-ptr.x,e.clientY-ptr.y)<10)toggle();ptr=null;input.l=input.r=input.u=input.d=input.f=input.b=0});

function toggle(){mag.on=!mag.on;if(!mag.on)release();hum(mag.on);}
function release(){if(held){held.held=false;held=null}}
function say(s){msg=s;msgT=2.6}

function step(dt){
 t+=dt;
 // carro
 const tgt=(input.r-input.l)*250;
 trolley.vx+=Math.max(-1,Math.min(1,(tgt-trolley.vx)/60))*Math.min(Math.abs(tgt-trolley.vx)/dt,700)*dt*(tgt==0?1.4:1);
 trolley.x=Math.max(50,Math.min(W-50,trolley.x+trolley.vx*dt));
 if(trolley.x<=50||trolley.x>=W-50)trolley.vx=0;
 trolley.z=Math.max(-110,Math.min(110,trolley.z+(input.b-input.f)*90*dt));mag.z+=(trolley.z-mag.z)*Math.min(1,2.2*dt);
 {const wt=(input.d-input.u)*140;trolley.wv=(trolley.wv||0);const dv=wt-trolley.wv;trolley.wv+=Math.max(-420*dt,Math.min(420*dt,dv));L=Math.max(70,Math.min(GY-RAIL-8,L+trolley.wv*dt));if(L<=70||L>=GY-RAIL-8)trolley.wv=0;}
 // viento
 gustT-=dt;if(gustT<0){gustT=3+rnd()*5;wind=(rnd()<.5?-1:1)*(150+rnd()*260);setTimeout(()=>{},0);flash=rnd()<.5?1:0;if(flash)thunder();}
 wind*=Math.pow(.55,dt);
 const wnow=wind+Math.sin(t*1.3)*45;
 // cuerda (verlet)
 const seg=L/N;
 rope[0].x=rope[0].px=trolley.x;rope[0].y=rope[0].py=RAIL;
 for(let i=1;i<=N;i++){const p=rope[i];
  const vx=(p.x-p.px)*.9985,vy=(p.y-p.py)*.9985;p.px=p.x;p.py=p.y;
  const wm=i==N?.5:1;
  p.x+=vx+wnow*wm*dt*dt*(p==mag&&held?.4:1)*(p==mag?.35:1);p.y+=vy+G*dt*dt;}
 // objetos
 if(held)held.z=mag.z;
 for(const o of objs){if(o.held)continue;o.vy+=G*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.ang+=o.av*dt;o.vx+=wnow*.04*dt*(o.m<3?1:0);}
 // atracción del imán
 if(mag.on&&!held){
  let best=null,bd=1e9;
  for(const o of objs){if(Math.abs(o.z-mag.z)>30)continue;const d=Math.hypot(o.x-mag.x,o.y-mag.y)-o.r-mag.r;if(d<bd&&o.m<=10){bd=d;best=o}}
  if(best&&bd<95){const dx=mag.x-best.x,dy=mag.y-best.y,dd=Math.hypot(dx,dy)||1;
   const f=Math.min(1,(95-bd)/95)*3200;best.vx+=dx/dd*f*dt/best.m*1.2;best.vy+=dy/dd*f*dt/best.m*1.2-0;
   mag.y+=0; if(bd<12){held=best;best.held=true;best.lvx=(mag.x-mag.px)/dt;best.lvy=(mag.y-mag.py)/dt;best.heldT=t;best.hist=[];
     if(!firstLift){firstLift=true;say('¡Agarrado!');}
     clang(.7,best.m);spark(mag.x,mag.y+10,8);shake=Math.max(shake,3)}}
 }
 // restricciones iterativas
 for(let it=0;it<18;it++){
  rope[0].x=trolley.x;rope[0].y=RAIL;
  for(let i=0;i<N;i++){const a=rope[i],b=rope[i+1];
   let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;const diff=(d-seg)/d;
   const wa=i==0?0:a.im,wb=b.im,ws=wa+wb;
   if(wa)(a.x+=dx*diff*wa/ws,a.y+=dy*diff*wa/ws);
   b.x-=dx*diff*wb/ws;b.y-=dy*diff*wb/ws;}
  if(held){const o=held;const dx=o.x-mag.x,dy=o.y-mag.y,d=Math.hypot(dx,dy)||1,want=o.r+mag.r-2,diff=(d-want)/d;
   const wa=mag.im,wb=o.im*.6,ws=wa+wb;
   mag.x+=dx*diff*wa/ws;mag.y+=dy*diff*wa/ws;o.x-=dx*diff*wb/ws;o.y-=dy*diff*wb/ws;
   // la carga sale sin velocidad propia: la derivamos
  }
 }
 if(held){const o=held;
  const nvx=(mag.x-mag.px)/dt,nvy=(mag.y-mag.py)/dt;
  o.vx=nvx;o.vy=nvy;o.av*=.98;
  (o.hist||(o.hist=[])).push([nvx,nvy]);if(o.hist.length>24)o.hist.shift();
  const h0=o.hist[0];const win=o.hist.length*dt;
  const ax=(nvx-h0[0])/win,ay=(nvy-h0[1])/win;
  const grip=KINDS[o.kind].grip;
  const f=Math.hypot(ax,ay)*o.m;
  if(window.__dbg&&f>grip*.5)window.__dbg.push([+t.toFixed(2),Math.round(f),grip]);
  if(f>grip&&t-o.heldT>.4){ // se suelta por tirón
   release();mag.on=false;hum(false);drops++;say('¡Se soltó!');spark(o.x,o.y,10);shake=Math.max(shake,6);}
 }
 // colisiones
 for(let it=0;it<3;it++){
  for(let i=0;i<objs.length;i++){const a=objs[i];
   for(let j=i+1;j<objs.length;j++){const b=objs[j];if(a.held&&b.held)continue;if(Math.abs(a.z-b.z)<34)circle(a,b)}
   ground(a);
   if(!a.held&&!mag.on||true){ if(!a.held&&Math.abs(a.z-mag.z)<34)magcol(a);}}
  magGround();
 }
 for(const o of objs){ // dentro del contenedor
  const ins=Math.abs(o.z)<=93&&o.x>712&&o.x<894&&o.y>GY-100&&o.y<GY;
  if(ins&&!o.inside&&!o.held&&Math.abs(o.vy)<400){o.inside=true;score++;sparkCol(o.x,o.y-20);clang(.5,o.m);say(score+' en el contenedor')}
  if(!ins&&o.inside&&o.x<700){o.inside=false;score--}
  o.hit=Math.max(0,o.hit-dt);
 }
 shake*=Math.pow(.02,dt);flash*=Math.pow(.05,dt);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.life-=dt}
 particles=particles.filter(p=>p.life>0);
 msgT-=dt;
}
function circle(a,b){
 let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,rr=a.r+b.r;
 if(d2>=rr*rr||d2==0)return;
 const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,pen=rr-d;
 const ia=a.held?0:a.im,ib=b.held?0:b.im,is=ia+ib;if(!is)return;
 a.x-=nx*pen*ia/is*.8;a.y-=ny*pen*ia/is*.8;b.x+=nx*pen*ib/is*.8;b.y+=ny*pen*ib/is*.8;
 const rvx=b.vx-a.vx,rvy=b.vy-a.vy,vn=rvx*nx+rvy*ny;
 if(vn<0){const e=Math.abs(vn)>120?Math.min(KINDS[a.kind].bounce,KINDS[b.kind].bounce):0;
  const j=-(1+e)*vn/is;a.vx-=nx*j*ia;a.vy-=ny*j*ia;b.vx+=nx*j*ib;b.vy+=ny*j*ib;
  // fricción tangencial
  const tx=-ny,ty=nx,vt=rvx*tx+rvy*ty;const jt=Math.max(-Math.abs(j)*.4,Math.min(Math.abs(j)*.4,-vt/is*.5));
  a.vx-=tx*jt*ia;a.vy-=ty*jt*ia;b.vx+=tx*jt*ib;b.vy+=ty*jt*ib;a.av-=jt*ia*.05/ (a.r/20);b.av+=jt*ib*.05/(b.r/20);
  if(-vn>180){impact(a.x+nx*a.r,a.y+ny*a.r,-vn,a,b)}}
}
function ground(o){
 let touched=false;
 if(o.y+o.r>GY){o.y=GY-o.r;if(o.vy>0){if(o.vy>200)impact(o.x,GY,o.vy,o,null);o.vy=o.vy>150?-o.vy*KINDS[o.kind].bounce:0}touched=true;
   o.vx*=Math.pow(.9,DT*60)}
 if(o.x-o.r<0){o.x=o.r;o.vx=Math.abs(o.vx)*.3}
 if(o.x+o.r>W){o.x=W-o.r;o.vx=-Math.abs(o.vx)*.3}
 for(const r of rects){
  if(r.x>300&&Math.abs(o.z)>93)continue;
  const cx=Math.max(r.x,Math.min(o.x,r.x+r.w)),cy=Math.max(r.y,Math.min(o.y,r.y+r.h));
  let dx=o.x-cx,dy=o.y-cy,d=Math.hypot(dx,dy);
  if(d<o.r){ if(d==0){dx=0;dy=-1;d=1} const nx=dx/d,ny=dy/d;o.x+=nx*(o.r-d);o.y+=ny*(o.r-d);
   const vn=o.vx*nx+o.vy*ny;if(vn<0){if(-vn>220)impact(cx,cy,-vn,o,null);o.vx-=(1+.25)*vn*nx;o.vy-=(1+.25)*vn*ny}}}
 if(touched&&!o.held){o.av+=((o.vx/o.r)-o.av)*.12}
 else if(!o.held){/* gira libre */}
 // pequeño amortiguamiento para que el montón repose
 if(Math.abs(o.vx)<4&&Math.abs(o.vy)<12&&touched){o.vx*=.9}
}
function magcol(o){
 if(o.held)return;
 const dx=o.x-mag.x,dy=o.y-mag.y,d=Math.hypot(dx,dy),rr=o.r+mag.r;
 if(d>=rr||d==0)return;
 const nx=dx/d,ny=dy/d,pen=rr-d;
 const ia=mag.im*.6,ib=o.im,is=ia+ib;
 mag.x-=nx*pen*ia/is;mag.y-=ny*pen*ia/is;mag.px-=nx*pen*ia/is;mag.py-=ny*pen*ia/is;
 o.x+=nx*pen*ib/is;o.y+=ny*pen*ib/is;
 const mvx=(mag.x-mag.px)/DT,mvy=(mag.y-mag.py)/DT;
 const vn=(o.vx-mvx)*nx+(o.vy-mvy)*ny;
 if(vn<0){const j=-(1.15)*vn/is;mag.px+=nx*j*ia*DT*-1*-1; /* empuja imán */ mag.px-= -nx*j*ia*DT*0; o.vx+=nx*j*ib;o.vy+=ny*j*ib;mag.px+=nx*j*ia*DT*0;
  mag.x-=nx*j*ia*DT*.5;mag.px-=nx*j*ia*DT*.5*0;
  if(-vn>200)impact(o.x-nx*o.r,o.y-ny*o.r,-vn,o,null)}
}
function magGround(){
 if(mag.x<mag.r){mag.x=mag.r;mag.px=Math.max(mag.px,mag.x-1)}
 if(mag.x>W-mag.r){mag.x=W-mag.r;mag.px=Math.min(mag.px,mag.x+1)}
 if(mag.y+mag.r>GY){mag.y=GY-mag.r;mag.py=Math.min(mag.py,mag.y)} 
 for(const r of rects){
  if(r.x>300&&Math.abs(mag.z)>93)continue;
  const cx=Math.max(r.x,Math.min(mag.x,r.x+r.w)),cy=Math.max(r.y,Math.min(mag.y,r.y+r.h));
  let dx=mag.x-cx,dy=mag.y-cy,d=Math.hypot(dx,dy);
  if(d<mag.r&&d>0){mag.x+=dx/d*(mag.r-d);mag.y+=dy/d*(mag.r-d);mag.px+=dx/d*(mag.r-d)*.5;mag.py+=dy/d*(mag.r-d)*.5}}
}
// efectos
function spark(x,y,n){for(let i=0;i<n;i++){const a=rnd()*6.28,s=80+rnd()*240;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,life:.3+rnd()*.4,c:'#ffd27a'})}}
function sparkCol(x,y){for(let i=0;i<16;i++){const a=-1.57+(rnd()-.5)*2,s=100+rnd()*260;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+rnd()*.5,c:'#8ff0b0'})}}
function impact(x,y,v,a,b){
 const s=Math.min(1,v/700);
 if(a.hit>0&&(!b||b.hit>0))return;a.hit=.08;if(b)b.hit=.08;
 clang(s,(a.m+(b?b.m:3))/2);
 if(v>360){spark(x,y,Math.floor(4+s*10));shake=Math.max(shake,2+s*8)}
}
// audio
let AC=null,humO=null,humG=null;
function initAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();
 humO=AC.createOscillator();humG=AC.createGain();humO.type='sawtooth';humO.frequency.value=58;humG.gain.value=0;humO.connect(humG).connect(AC.destination);humO.start();
 const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=2500;const g=AC.createGain();g.gain.value=.05;ns.connect(f).connect(g).connect(AC.destination);ns.start();}catch(e){}}
function hum(on){if(humG)humG.gain.setTargetAtTime(on?.06:0,AC.currentTime,.05)}
function clang(s,m){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type='square';
 o.frequency.value=(180+Math.random()*60)*(m>5?.6:1.2)*(1+s*.4);g.gain.setValueAtTime(.08*s+.01,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0005,AC.currentTime+.18);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+.2)}
function thunder(){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.value=40;g.gain.setValueAtTime(.15,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+1.2);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+1.3)}

//RENDER
// bucle
let last=performance.now(),acc=0;
function frame(n){const dt=Math.min(.05,(n-last)/1000);last=n;acc+=dt;
 while(acc>=1/60){for(let i=0;i<SUB;i++)step(DT);acc-=1/60}
 render();requestAnimationFrame(frame)}
requestAnimationFrame(frame);
// gancho de pruebas
window.__cand=()=>{let best=null,bd=1e9;for(const o of objs){if(Math.abs(o.z-mag.z)>30||o.held)continue;const d=Math.hypot(o.x-mag.x,o.y-mag.y)-o.r-mag.r;if(d<bd&&o.m<=10){bd=d;best=o}}return bd<95?best:null};
window.__g={get s(){return {objs,mag,trolley,L,held,score,drops,firstLift,t,rope}},step,reset,input,toggle,DT,SUB,draw:()=>render(),setWind(w){wind=w},KINDS};
