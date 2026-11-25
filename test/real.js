// Ciclo completo SOLO con teclado real (puppeteer keyboard). Las lecturas de estado no ejecutan acciones.
const pp=require('puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await pp.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'],headless:'new'});
const p=await b.newPage();await p.setViewport({width:960,height:540});const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.evaluateOnNewDocument(()=>{window.__aud={osc:0,gainSet:0,ctx:0};const AC=window.AudioContext;window.AudioContext=function(){window.__aud.ctx++;const c=new AC();const co=c.createOscillator.bind(c);c.createOscillator=function(){window.__aud.osc++;return co()};return c};});
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+'?lowres');await sleep(700);
const S=()=>p.evaluate(()=>{const s=window.__g.s;return {t:s.t,x:s.mag.x,y:s.mag.y,z:s.mag.z,tx:s.trolley.x,tz:s.trolley.z,held:s.held&&s.held.kind,hz:s.held&&s.held.z,score:s.score,drops:s.drops,objs:s.objs.map(o=>({k:o.kind,x:o.x,y:o.y,z:o.z,r:o.r})),on:s.mag.on}});
const k=p.keyboard;
const hold=async(key,cond,max=15000)=>{await k.down(key);const t0=Date.now();while(Date.now()-t0<max){const s=await S();if(cond(s))break;await sleep(25)}await k.up(key)};

const goX=async(tx,done,max=60000)=>{let prev=await S(),cur='';const t0=Date.now();
 while(Date.now()-t0<max){await sleep(25);const q=await S();const dt=q.t-prev.t;if(dt<=0)continue;const mv=(q.x-prev.x)/dt;prev=q;
  const v=2.5*(tx-q.x)-1.1*mv;const want=v>40?'ArrowRight':v<-40?'ArrowLeft':'';
  if(want!==cur){if(cur)await k.up(cur);if(want)await k.down(want);cur=want}
  if(Math.abs(tx-q.x)<8&&Math.abs(mv)<25&&done!==false)break;}
 if(cur)await k.up(cur);};
// fps real
const t0=await S();await sleep(1000);const t1=await S();console.log('sim seconds per real second',(t1.t-t0.t).toFixed(2));
await sleep(3000); // asentar
await k.press('Space');await sleep(100);await k.press('Space'); // activa audio y deja el imán apagado
let s=await S();const tgt=s.objs.find(o=>o.k=='ball'&&o.z==0&&o.x>350);console.log('target',JSON.stringify(tgt));
// profundidad: z hasta 0 (ya) y mover x
const tx=tgt.x;
await goX(tx);await sleep(300);s=await S();console.log('after x',Math.round(s.x),Math.round(s.z));
await p.screenshot({path:'/tmp/crane-r1-aligning.png'});
await hold('ArrowDown',q=>q.y>tgt.y-tgt.r-45);await sleep(1200);
s=await S();console.log('lowered',Math.round(s.x),Math.round(s.y));await p.screenshot({path:'/tmp/crane-r2-lowered.png'});
await k.press('Space');await sleep(1200);s=await S();console.log('held',s.held,'on',s.on);
await p.screenshot({path:'/tmp/crane-r3-grabbed.png'});
await hold('ArrowUp',q=>q.y<330);await sleep(500);
await goX(800,true,40000);
await sleep(100);s=await S();console.log('carrying held',s.held,'x',Math.round(s.x),'drops',s.drops);await p.screenshot({path:'/tmp/crane-r4-carry.png'});
// esperar a que el imán quede sobre el contenedor
let n=0;while(n++<1200){s=await S();if(s.x>750&&s.x<850&&s.held&&Math.abs(s.x-s.tx)<70)break;await sleep(15)}
console.log('release x',Math.round(s.x),'held',s.held);
await k.press('Space');await sleep(2500);s=await S();console.log('final score',s.score,'drops',s.drops);
await p.screenshot({path:'/tmp/crane-r5-dropped.png'});
const aud=await p.evaluate(()=>window.__aud);console.log('audio',JSON.stringify(aud),'errs',errs);
await b.close()})();
