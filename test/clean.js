const pp=require('puppeteer-core');
(async()=>{const b=await pp.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],headless:'new'});
const p=await b.newPage();await p.setViewport({width:960,height:540});const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+'');await new Promise(r=>setTimeout(r,600));
const res=await p.evaluate(()=>{const g=window.__g,out={};
 const F=(inp,n=1)=>{for(let j=0;j<n;j++){Object.assign(g.input,{l:0,r:0,u:0,d:0,f:0,b:0},inp);for(let i=0;i<g.SUB;i++)g.step(g.DT)}};
 const place=(x,z)=>{const T=g.s.trolley;T.x=x;T.vx=0;T.z=z;g.s.mag.z=z;g.s.rope.forEach((q,i)=>{q.x=q.px=x;q.y=q.py=58+i*(g.s.L/11)})};
 const lower=(o)=>{let n=0;while(g.s.mag.y<o.y-o.r-25&&n++<900)F({d:1})};
 // 1) carril de profundidad: solo la pieza z=0 en escena
 for(const zc of[70,0]){g.reset();F({},200);const keep=g.s.objs.find(o=>o.kind=='ball'&&o.z==0);g.s.objs.length=0;g.s.objs.push(keep);
  place(keep.x,zc);F({},30);lower(keep);g.toggle();F({},120);out['lane_z'+zc]={held:!!g.s.held};g.toggle()}
 // 2) traslado y suelta sobre contenedor: z=0 vs z=85
 for(const zr of[0,110]){g.reset();F({},200);const o=g.s.objs.find(o=>o.kind=='ball'&&o.z==0&&o.x>400);place(o.x,0);F({},30);lower(o);g.toggle();F({},60);
  let n=0;while(g.s.mag.y>300&&n++<900)F({u:1});F({},60);
  n=0;while(g.s.trolley.x<820&&n++<1500)F({r:1});
  n=0;while(Math.abs(g.s.trolley.z-zr)>2&&n++<900)F(zr>g.s.trolley.z?{b:1}:{f:1});
  // esperar a que el balanceo en x baje
  n=0;while(!(g.s.mag.x>760&&g.s.mag.x<845)&&n++<3000)F({});
  const hx=Math.round(g.s.mag.x),held=!!g.s.held;g.toggle();F({},240);
  out['drop_z'+zr]={heldBeforeRelease:held,releaseX:hx,score:g.s.score,objX:Math.round(o.x),objZ:Math.round(o.z),objY:Math.round(o.y)};}
 g.draw();return out});
await p.screenshot({path:'/tmp/crane-g-zmiss110.png'});console.log(JSON.stringify(res),errs);await b.close()})();
