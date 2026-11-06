import * as THREE from './three.module.js';
// Optional product visual. Use media: { type: 'three', variant: 0 } in content.js.
export function mountProductScene(container,{label,variant=0}){
  const canvas=document.createElement('canvas');canvas.className='media-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',label);container.append(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.z=7;
  scene.add(new THREE.AmbientLight(0xffffff,2.5));const light=new THREE.DirectionalLight(0xeeffdd,4);light.position.set(-3,5,5);scene.add(light);
  const group=new THREE.Group();group.rotation.set(.2,-.3,-.15);scene.add(group);const nodes=[];
  const brandColor=new THREE.Color(getComputedStyle(container).getPropertyValue('--brand').trim()||'#c4e99b');
  for(let i=0;i<3;i++){const geometry=new THREE.TorusGeometry(.7,.18,24,72);const color=brandColor.clone().multiplyScalar(.55+i*.225);const material=new THREE.MeshStandardMaterial({color,roughness:.3,metalness:.35});const mesh=new THREE.Mesh(geometry,material);mesh.position.set((i-1)*.55,(i-1)*.6,(i-1)*.25);group.add(mesh);nodes.push(mesh);}
  let frame=0,time=variant,last=0,disposed=false;
  const render=()=>renderer.render(scene,camera);
  const resize=()=>{if(disposed)return;const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=r.width<180?11:7;camera.updateProjectionMatrix();render();};
  function tick(now){frame=0;if(disposed||document.hidden||window.PORTFOLIO_MOTION_PAUSED){last=0;render();return;}time+=last?Math.min((now-last)/1000,.05):0;last=now;nodes.forEach((node,i)=>{node.rotation.y=Math.sin(time*.4+i)*.3;});group.rotation.z=-.15+Math.sin(time*.2)*.08;render();frame=requestAnimationFrame(tick);}
  function start(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!disposed&&!document.hidden&&!window.PORTFOLIO_MOTION_PAUSED)frame=requestAnimationFrame(tick);else if(!disposed)render();}
  const observer=new ResizeObserver(resize);observer.observe(container);window.addEventListener('portfolio:motion',start);document.addEventListener('visibilitychange',start);resize();start();
  return ()=>{disposed=true;if(frame)cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('portfolio:motion',start);document.removeEventListener('visibilitychange',start);nodes.forEach(n=>{n.geometry.dispose();n.material.dispose();});renderer.dispose();canvas.remove();};
}
