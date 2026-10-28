const viewer=document.querySelector('#viewer');
document.querySelectorAll('[data-full]').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img');viewer.querySelector('img').src=button.dataset.full;viewer.querySelector('img').alt=source.alt;viewer.querySelector('p').textContent=source.alt;viewer.showModal()}));
viewer.querySelector('.close').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
const drawingArea=document.querySelector('#firework-area');
if(drawingArea){
 const canvas=drawingArea.querySelector('canvas'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),status=document.querySelector('#firework-status');
 const fireworks=[],palette=['#97f5ca','#b69aff','#ffc67c','#ff88b3','#81dfff','#f3ef9c'];
 let width=0,height=0,frame=0,count=0,previousColor=-1,previousShape=-1,visible=true,cleanupTimer=0;
 function differentIndex(length,previous){return (previous+1+Math.floor(Math.random()*(length-1)))%length}
 function drawFirework(f,now){
  const looping=f.starter&&!reduced.matches;
  const elapsed=now-f.created,cycle=looping?(elapsed+f.cycleOffset)%2300:elapsed;
  // Replay the same 500 ms expansion as a visitor-created firework, then fade and restart.
  const progress=reduced.matches?1:Math.min(1,cycle/500),ease=1-Math.pow(1-progress,3);
  const lifetimeFade=f.starter?1:Math.max(0,Math.min(1,(40000-elapsed)/2000));
  const fade=(looping?Math.max(0,1-Math.max(0,cycle-1150)/550):1)*lifetimeFade;
  const radius=f.size*ease;
  ctx.save();ctx.translate(f.x*width,f.y*height);ctx.rotate(f.rotation);ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.lineWidth=f.line;ctx.lineCap='round';ctx.globalAlpha=(.35+.65*ease)*fade;ctx.shadowColor=f.color;ctx.shadowBlur=4;
  // Each shape is a single burst centered precisely where the visitor clicked.
  for(let i=0;i<f.rays;i++){
   const angle=i*Math.PI*2/f.rays;
   ctx.save();ctx.rotate(angle);
   if(f.shape===0){ // Fine rays with separate sparks.
    ctx.beginPath();ctx.moveTo(radius*.2,0);ctx.lineTo(radius*.8,0);ctx.stroke();ctx.beginPath();ctx.arc(radius,0,f.dot,0,Math.PI*2);ctx.fill();
   }else if(f.shape===1){ // Petal-shaped loops.
    ctx.beginPath();ctx.moveTo(radius*.12,0);ctx.bezierCurveTo(radius*.6,-radius*.2,radius*1.2,-radius*.12,radius,0);ctx.bezierCurveTo(radius*1.2,radius*.12,radius*.6,radius*.2,radius*.12,0);ctx.stroke();
   }else if(f.shape===2){ // Dotted rings.
    for(let ring=1;ring<=3;ring++){ctx.beginPath();ctx.arc(radius*ring/3,0,f.dot*(ring===3?1:.65),0,Math.PI*2);ctx.fill()}
   }else if(f.shape===3){ // Curving spiral rays.
    ctx.beginPath();ctx.moveTo(radius*.1,0);ctx.quadraticCurveTo(radius*.75,-radius*.35,radius,0);ctx.stroke();ctx.beginPath();ctx.arc(radius,0,f.dot*.7,0,Math.PI*2);ctx.fill();
   }else{ // Alternating star-shaped points.
    ctx.beginPath();ctx.moveTo(radius*.22,-radius*.045);ctx.lineTo(radius*(i%2?.7:1),0);ctx.lineTo(radius*.22,radius*.045);ctx.stroke();
   }
   ctx.restore();
  }
  ctx.shadowBlur=0;ctx.beginPath();ctx.arc(0,0,f.dot*1.1,0,Math.PI*2);ctx.fill();ctx.restore();
  return progress<1||looping||(!f.starter&&elapsed>=38000);
 }
 function render(now=performance.now()){
  frame=0;
  for(let i=fireworks.length-1;i>=0;i--)if(!fireworks[i].starter&&now-fireworks[i].created>=40000)fireworks.splice(i,1);
  ctx.clearRect(0,0,width,height);let animating=false;
  for(const f of fireworks)animating=drawFirework(f,now)||animating;
  if(animating&&!reduced.matches&&!document.hidden&&visible)frame=requestAnimationFrame(render);
 }
 function scheduleCleanup(){
  clearTimeout(cleanupTimer);
  const now=performance.now(),deadlines=fireworks.filter(f=>!f.starter).map(f=>f.created+(now-f.created<38000?38000:40000));
  if(deadlines.length)cleanupTimer=setTimeout(()=>{cancelAnimationFrame(frame);render();scheduleCleanup()},Math.max(1,Math.min(...deadlines)-now));
 }
 function clearAddedFireworks(){
  for(let i=fireworks.length-1;i>=0;i--)if(!fireworks[i].starter)fireworks.splice(i,1);
  scheduleCleanup();cancelAnimationFrame(frame);render();
 }
 function resize(){const bounds=drawingArea.getBoundingClientRect();width=canvas.clientWidth;height=canvas.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);cancelAnimationFrame(frame);render()}
 function addFirework(x,y,starter=false){
  previousColor=differentIndex(palette.length,previousColor);previousShape=differentIndex(5,previousShape);
  fireworks.push({x,y,starter,cycleOffset:starter?fireworks.length*750:0,color:palette[previousColor],shape:previousShape,size:25+Math.random()*Math.min(65,width*.15),rotation:Math.random()*Math.PI*2,rays:10+Math.floor(Math.random()*15),line:.9+Math.random()*.8,dot:1.3+Math.random()*1.8,created:performance.now()});
  if(!starter){count++;status.textContent=`${count} ${count===1?'firework':'fireworks'} added.`;scheduleCleanup();}cancelAnimationFrame(frame);render();
 }
 // Listen to click only: touch-generated clicks add exactly one burst, not two.
 drawingArea.addEventListener('click',event=>{const rect=canvas.getBoundingClientRect();addFirework(Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height)))});
 drawingArea.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();addFirework(.5,.5)}});
 reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);render()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else render()});
 new ResizeObserver(resize).observe(drawingArea);resize();
 new IntersectionObserver(entries=>{const entry=entries[0];visible=entry.isIntersecting;cancelAnimationFrame(frame);if(!visible&&entry.boundingClientRect.bottom<=0)clearAddedFireworks();else if(visible)render()}).observe(drawingArea);
 // Three staggered bursts replay automatically before any visitor interaction.
 addFirework(.2,.38,true);addFirework(.5,.62,true);addFirework(.8,.32,true);
}

// Keep the proposal contents in sync with the reader's scroll position.
(()=>{
 const nav=document.querySelector('.proposal-section-nav');
 if(!nav)return;
 const links=[...nav.querySelectorAll('a[href^="#"]')];
 const targets=links.map(link=>document.getElementById(link.hash.slice(1)));
 links.forEach((link,index)=>link.addEventListener('click',event=>{const target=targets[index];if(!target)return;event.preventDefault();history.pushState(null,'',link.hash);window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-30,behavior:'instant'});update()}));
 let scheduled=false;
 function update(){
  scheduled=false;
  let active=0;
  targets.forEach((target,index)=>{if(target&&target.getBoundingClientRect().top<=130)active=index});
  if(innerHeight+scrollY>=document.documentElement.scrollHeight-2)active=links.length-1;
  links.forEach((link,index)=>{if(index===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
 }
 window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
 window.addEventListener('resize',update);
 window.addEventListener('hashchange',update);
 update();
})();

// Select a stage in the proposal; the storyboard remains visible below.
(()=>{
 const list=document.querySelector('.journey-stage-tabs');if(!list)return;
 const tabs=[...list.querySelectorAll('[role="tab"]')];
 function select(index,focus=false){tabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!active});if(focus)tabs[index].focus()}
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true)})});
})();
