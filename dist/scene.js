// All continuous movement in this portfolio is rendered with Three.js.
const canvas=document.querySelector('#three-scene');
const fallback=()=>{canvas.style.display='none';document.querySelector('.visual-fallback').style.display='flex';const button=document.querySelector('#motion');button.disabled=true;button.title='Animação 3D indisponível neste navegador';button.setAttribute('aria-label','Animação 3D indisponível neste navegador');};
try {
  const THREE=await import('./three.module.js');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.2,8.7);
  scene.add(new THREE.AmbientLight(0xe1eddd,2));
  const key=new THREE.DirectionalLight(0xeeffe4,4.6);key.position.set(-3,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0x97c9a0,2.8);rim.position.set(4,0,2);scene.add(rim);
  const layers=new THREE.Group();layers.rotation.set(.34,-.48,-.34);layers.position.y=.13;scene.add(layers);
  function roundRect(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  const shape=roundRect(2.65,1.85,.22), geometry=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:4,bevelSize:.04,bevelThickness:.035,steps:1});
  const colors=[0x414c3a,0x7d9868,0xc7e6a6];
  const sheets=[];
  colors.forEach((color,i)=>{const material=new THREE.MeshStandardMaterial({color,metalness:.3,roughness:.32});const sheet=new THREE.Mesh(geometry,material);sheet.position.set((i-1)*.05,(i-1)*.63,(i-1)*.45);sheet.rotation.x=-.3;layers.add(sheet);sheets.push(sheet);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:i===2?0xebffcc:0xb7d49d,transparent:true,opacity:i===2?.42:.14}));sheet.add(edges);});
  // A raised arrow is a product-direction symbol, not an imitation of a product UI.
  const arrow=new THREE.Shape();arrow.moveTo(-.56,-.38);arrow.lineTo(.12,.3);arrow.lineTo(-.31,.3);arrow.lineTo(-.31,.49);arrow.lineTo(.49,.49);arrow.lineTo(.49,-.31);arrow.lineTo(.3,-.31);arrow.lineTo(.3,.12);arrow.lineTo(-.38,-.56);arrow.closePath();
  const mark=new THREE.Mesh(new THREE.ExtrudeGeometry(arrow,{depth:.035,bevelEnabled:false}),new THREE.MeshStandardMaterial({color:0x263420,roughness:.55}));mark.position.set(0,0,.17);sheets[2].add(mark);
  const orbit=new THREE.Group();orbit.rotation.set(.5,.2,-.32);scene.add(orbit);
  const torus=new THREE.Mesh(new THREE.TorusGeometry(2.04,.012,8,160),new THREE.MeshStandardMaterial({color:0xa9bb96,metalness:.7,roughness:.35}));torus.scale.y=.69;orbit.add(torus);
  const satellite=new THREE.Mesh(new THREE.SphereGeometry(.1,24,24),new THREE.MeshStandardMaterial({color:0xd9f3b4,metalness:.3,roughness:.25}));orbit.add(satellite);
  let pointerX=0,pointerY=0,visible=true,frame=0,time=0,last=0;
  const isPaused=()=>window.PORTFOLIO_MOTION_PAUSED;
  function render(){renderer.render(scene,camera);}
  function tick(timestamp){frame=0;if(!visible||document.hidden||isPaused()){last=0;render();return;}const delta=last?Math.min((timestamp-last)/1000,.05):0;last=timestamp;time+=delta;layers.rotation.y+=( -.48+pointerX*.18-layers.rotation.y)*.04;layers.rotation.x+=(.34-pointerY*.12-layers.rotation.x)*.04;sheets.forEach((sheet,i)=>{sheet.position.y=(i-1)*.63+Math.sin(time*.65+i*.7)*.035;});satellite.position.set(Math.cos(time*.22+1.2)*2.04,Math.sin(time*.22+1.2)*2.04*.69,0);render();frame=requestAnimationFrame(tick);}
  function start(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!document.hidden&&!isPaused())frame=requestAnimationFrame(tick);else render();}
  const resize=()=>{const rect=canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.position.z=rect.width<300?10:8.7;camera.updateProjectionMatrix();render();};
  new ResizeObserver(resize).observe(canvas.parentElement);
  canvas.addEventListener('pointermove',event=>{if(isPaused())return;const r=canvas.getBoundingClientRect();pointerX=(event.clientX-r.left)/r.width-.5;pointerY=(event.clientY-r.top)/r.height-.5;});canvas.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();}).observe(canvas);
  window.addEventListener('portfolio:motion',start);document.addEventListener('visibilitychange',start);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(frame)cancelAnimationFrame(frame);fallback();});
  satellite.position.set(Math.cos(1.2)*2.04,Math.sin(1.2)*2.04*.69,0);resize();start();
}catch(error){console.info('Visual 3D indisponível; representação estática ativada.');fallback();}
