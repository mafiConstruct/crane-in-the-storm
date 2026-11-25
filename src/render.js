const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!/lowres/.test(location.search),preserveDrawingBuffer:true});
const LOW=/lowres/.test(location.search);renderer.setSize(LOW?320:960,LOW?180:540,false);renderer.setPixelRatio(1);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x151c27);scene.fog=new THREE.Fog(0x151c27,900,1700);
const camera=new THREE.PerspectiveCamera(34,960/540,10,3000);
camera.position.set(0,680,800);camera.lookAt(0,130,0);
const amb=new THREE.AmbientLight(0xc4d2e8,1.9);scene.add(amb);
const sun=new THREE.DirectionalLight(0xffe8c8,1.1);sun.position.set(-300,600,400);scene.add(sun);
const mk=(g,c,rough=.8,metal=.2)=>new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal}));
const X=x=>x-480,Y=y=>GY-y;
// suelo y carriles de profundidad
const groundM=mk(new THREE.BoxGeometry(1400,10,420),0x8b7c66);groundM.position.set(0,-5,0);scene.add(groundM);
const laneCol={'-70':0x4aa3ff,'0':0xffd24a,'70':0xff6a5a};for(const z of[-70,0,70]){const l=new THREE.Mesh(new THREE.BoxGeometry(1400,.8,3),new THREE.MeshBasicMaterial({color:laneCol[z],transparent:true,opacity:.55}));l.position.set(0,.4,z);scene.add(l)}
// fondo: montañas de chatarra
const back=mk(new THREE.BoxGeometry(1400,160,20),0x1d2530);back.position.set(0,70,-210);scene.add(back);
// contenedor (z +-80)
const cm=0x3f8c76;
const cL=mk(new THREE.BoxGeometry(10,100,190),cm);cL.position.set(X(705),50,0);scene.add(cL);
const cR=mk(new THREE.BoxGeometry(10,100,190),cm);cR.position.set(X(901),50,0);scene.add(cR);
const cB=mk(new THREE.BoxGeometry(206,100,8),cm);cB.position.set(X(803),50,-95);scene.add(cB);
const cF=mk(new THREE.BoxGeometry(206,100,8),cm);cF.material.transparent=true;cF.material.opacity=.28;cF.position.set(X(803),50,95);scene.add(cF);
const cFl=mk(new THREE.BoxGeometry(206,4,190),0x2f6b5a);cFl.position.set(X(803),2,0);scene.add(cFl);
// muro del montón
const pw=mk(new THREE.BoxGeometry(10,46,190),0x6a6258);pw.position.set(X(267),23,0);scene.add(pw);
// puente grúa
for(const z of[-130,130]){const r=mk(new THREE.BoxGeometry(1100,8,8),0x9b8340);r.position.set(0,Y(RAIL)+12,z);scene.add(r)}
for(const x of[-520,520])for(const z of[-130,130]){const p=mk(new THREE.BoxGeometry(8,Y(RAIL)+12,8),0x53461f);p.position.set(x,(Y(RAIL)+12)/2,z);scene.add(p)}
const bridge=mk(new THREE.BoxGeometry(12,10,272),0xb58a22);scene.add(bridge);
const trol=mk(new THREE.BoxGeometry(40,18,34),0xd9a82e);scene.add(trol);
// cuerda
const ropeGeo=new THREE.BufferGeometry();ropeGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array((N+2)*3),3));
const ropeLine=new THREE.Line(ropeGeo,new THREE.LineBasicMaterial({color:0xe8e0c8}));ropeLine.frustumCulled=false;scene.add(ropeLine);
// imán
const magG=new THREE.Group();
const mb=mk(new THREE.CylinderGeometry(22,22,34,24),0xb8322a,.5,.5);mb.rotation.x=Math.PI/2;magG.add(mb);
const mp=mk(new THREE.BoxGeometry(10,13,36),0xd8d8d8,.3,.8);mp.position.set(-15,-13,0);magG.add(mp);
const mp2=mp.clone();mp2.position.x=15;magG.add(mp2);
const field=new THREE.Mesh(new THREE.SphereGeometry(95,24,16),new THREE.MeshBasicMaterial({color:0x78c8ff,transparent:true,opacity:.12,depthWrite:false}));magG.add(field);
scene.add(magG);
const blobTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
function blob(){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=1;scene.add(m);return m}
const magSh=blob();const plumbG=new THREE.BufferGeometry();plumbG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const plumb=new THREE.Line(plumbG,new THREE.LineBasicMaterial({color:0x78c8ff,transparent:true,opacity:.6}));plumb.frustumCulled=false;scene.add(plumb);const ring=new THREE.Mesh(new THREE.RingGeometry(26,31,32),new THREE.MeshBasicMaterial({color:0x78c8ff,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=1.5;scene.add(ring);
// piezas
function objMesh(o){
 const k=o.kind,r=o.r,g=new THREE.Group();
 if(k=='tire'){const t=mk(new THREE.TorusGeometry(r*.72,r*.3,12,28),0x1c1c1c,.9,0);g.add(t);const h=mk(new THREE.CylinderGeometry(r*.45,r*.45,8,16),0x666666,.4,.6);h.rotation.x=Math.PI/2;g.add(h);
  const mk2=mk(new THREE.BoxGeometry(4,8,10),0xcccccc);mk2.position.y=r*.9;g.add(mk2)}
 else if(k=='barrel'){const c=mk(new THREE.CylinderGeometry(r,r,44,24),0x8a4b2a,.7,.3);c.rotation.x=Math.PI/2;g.add(c);for(const dz of[-10,10]){const b=mk(new THREE.CylinderGeometry(r+1,r+1,4,24),0xc97a3c,.5,.4);b.rotation.x=Math.PI/2;b.position.z=dz*1.3;g.add(b)}}
 else if(k=='ball'){g.add(mk(new THREE.SphereGeometry(r,20,14),0xaab4be,.25,.9));const m=mk(new THREE.BoxGeometry(3,10,3),0x38414a);m.position.y=r;g.add(m)}
 else if(k=='gear'){const c=mk(new THREE.CylinderGeometry(r-2,r-2,14,20),0x7d8995,.4,.8);c.rotation.x=Math.PI/2;g.add(c);for(let i=0;i<8;i++){const a=i*Math.PI/4;const t=mk(new THREE.BoxGeometry(7,7,14),0x7d8995,.4,.8);t.position.set(Math.cos(a)*r,Math.sin(a)*r,0);t.rotation.z=a;g.add(t)}}
 else{const c=mk(new THREE.SphereGeometry(r,22,16),0x5a3b2e,.6,.5);g.add(c);const b=mk(new THREE.TorusGeometry(r*.95,3,8,28),0xcaa24a,.4,.7);g.add(b)}
 scene.add(g);o.mesh=g;o.sh=blob();
}
// partículas
const pMax=200,pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pMax*3),3));
const pPts=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xffd27a,size:5}));pPts.frustumCulled=false;scene.add(pPts);
// lluvia
const rainN=260,rainPos=new Float32Array(rainN*6),rainSt=[];for(let i=0;i<rainN;i++)rainSt.push([Math.random()*1200-600,Math.random()*520,Math.random()*400-200,.6+Math.random()*.8]);
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainL=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xaac4e0,transparent:true,opacity:.35}));rainL.frustumCulled=false;scene.add(rainL);
// HUD DOM
const hud=document.createElement('div');hud.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;font:15px system-ui;color:#e8e2d0';
hud.innerHTML='<div id="h1" style="position:absolute;left:16px;top:12px"></div><div id="h2" style="position:absolute;right:16px;top:12px;opacity:.6"></div><div id="h3" style="position:absolute;left:0;right:0;top:11%;text-align:center;font-weight:bold;font-size:22px;color:#ffe6a0"></div><div id="h4" style="position:absolute;left:0;right:0;top:17%;text-align:center;font-size:16px"></div><div style="position:absolute;left:16px;bottom:10px;font-size:13px;opacity:.65">◀ ▶ carro · ▲ ▼ cable · Q E profundidad · ESPACIO imán · R reiniciar</div>';
document.body.appendChild(hud);
let seenObjs=null;
function render(){
 if(seenObjs!==objs){seenObjs=objs;}
 for(const o of objs){if(!o.mesh)objMesh(o)}
 // limpiar meshes de objetos viejos tras reset
 scene.children.filter(c=>c.userData.o&&!objs.includes(c.userData.o)).forEach(c=>scene.remove(c));
 for(const o of objs){const m=o.mesh;m.userData.o=o;m.position.set(X(o.x),Y(o.y),o.z);m.rotation.z=-o.ang;
  const h=Math.max(0,Y(o.y)-o.r);const s=o.r*2.2*(1+h/260);o.sh.scale.set(s,s,1);o.sh.position.set(X(o.x),1,o.z);o.sh.material.opacity=Math.max(.3,1-h/400);o.sh.userData.o=o;}
 trol.position.set(X(trolley.x),Y(RAIL)+3,trolley.z);bridge.position.set(X(trolley.x),Y(RAIL)+10,0);
 const pos=ropeGeo.attributes.position.array;
 for(let i=0;i<=N;i++){const p=rope[i];const f=i/N;pos[i*3]=X(p.x);pos[i*3+1]=Y(p.y);pos[i*3+2]=trolley.z+(mag.z-trolley.z)*f}
 pos[(N+1)*3]=X(mag.x);pos[(N+1)*3+1]=Y(mag.y)-mag.r+4;pos[(N+1)*3+2]=mag.z;ropeGeo.attributes.position.needsUpdate=true;
 magG.position.set(X(mag.x),Y(mag.y),mag.z);field.visible=mag.on;field.material.opacity=.08+.05*Math.sin(t*18);
 const mh=Math.max(0,Y(mag.y)-mag.r);const ms=mag.r*2.4*(1+mh/260);magSh.scale.set(ms,ms,1);magSh.position.set(X(mag.x),1.2,mag.z);magSh.material.opacity=Math.max(.35,.95-mh/400);ring.position.set(X(mag.x),1.6,mag.z);ring.visible=true;{const pa=plumbG.attributes.position.array;pa[0]=X(mag.x);pa[1]=Y(mag.y)-mag.r;pa[2]=mag.z;pa[3]=X(mag.x);pa[4]=1.6;pa[5]=mag.z;plumbG.attributes.position.needsUpdate=true}
 const cand=window.__cand();for(const o of objs){const on=(o===cand&&mag.on&&!o.held)||(o===cand&&!mag.on);o.mesh.traverse(c=>{if(c.material&&c.material.emissive)c.material.emissive.setHex(on?0x1f5f9a:0)})}
 const pp=pGeo.attributes.position.array;for(let i=0;i<pMax;i++){const p=particles[i];if(p){pp[i*3]=X(p.x);pp[i*3+1]=Y(p.y);pp[i*3+2]=mag.z}else{pp[i*3]=pp[i*3+1]=-9999}}pGeo.attributes.position.needsUpdate=true;
 const wv=wind;for(let i=0;i<rainN;i++){const r=rainSt[i];r[1]-=14*r[3];r[0]+=(wv*.01+1)*r[3];if(r[1]<0){r[1]=520;r[0]=Math.random()*1200-600}if(r[0]>600)r[0]=-600;if(r[0]<-600)r[0]=600;
  rainPos.set([r[0],r[1],r[2],r[0]+wv*.02-2,r[1]+14*r[3],r[2]],i*6)}rainGeo.attributes.position.needsUpdate=true;
 amb.intensity=1.9+flash*2;sun.intensity=1.1+flash*2;
 camera.position.x=(Math.random()-.5)*shake*.6;camera.position.y=680+(Math.random()-.5)*shake*.6;
 renderer.render(scene,camera);
 document.getElementById('h1').textContent='Contenedor: '+score+'   Soltadas: '+drops;
 document.getElementById('h2').textContent=Math.abs(wind)>80?(wind>0?'viento →':'← viento'):'';
 document.getElementById('h3').textContent=msgT>0?msg:'';
 document.getElementById('h4').textContent=(!firstLift&&t<40)?'Alineá el anillo azul con una pieza (Q/E = profundidad), bajá, ESPACIO y subila. La pieza que agarraría se ilumina.':'';
}
