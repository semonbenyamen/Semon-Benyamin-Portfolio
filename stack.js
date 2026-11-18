// Orthographic projection keeps every trace and connector attached as the stack turns.
function startStack() {
  const canvas = document.querySelector('#model');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width, height, scale, yaw = 0.65, drag = null;
  const accent = '#71fbf0';
  function project(x,y,z) {
    const a = Math.cos(yaw), b = Math.sin(yaw);
    return [(x*a-y*b)*scale+width*.5, ((x*b+y*a)*.42-z)*scale+height*.514];
  }
  function shape(points, fill, stroke, weight=1) {
    ctx.beginPath();
    points.forEach((p,i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    if (fill) { ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=weight; ctx.stroke(); }
  }
  function rect(x,y,w,d,z,fill,stroke,weight) {
    shape([[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(p=>project(...p,z)),fill,stroke,weight);
  }
  function line(a,b,stroke,thickness) {shape([project(...a),project(...b)],null,stroke,thickness);}
  function plate(radius,z,depth,top,edge,cut=9) {
    const r=radius,k=cut;
    const ring=[[-r+k,-r],[r-k,-r],[r,-r+k],[r,r-k],[r-k,r],[-r+k,r],[-r,r-k],[-r,-r+k]];
    const bottom=ring.map(p=>project(...p,z-depth)), upper=ring.map(p=>project(...p,z));
    shape(bottom,'#10222c',edge,.7);
    const sides=ring.map((p,i)=>({i,y:(upper[i][1]+upper[(i+1)%8][1])/2})).sort((a,b)=>a.y-b.y);
    for(const {i} of sides) {
      const j=(i+1)%8;
      const grad=ctx.createLinearGradient(0,upper[i][1],0,bottom[i][1]);
      grad.addColorStop(0,'#40616b');grad.addColorStop(.16,'#1c353f');grad.addColorStop(.85,'#0c1923');grad.addColorStop(1,'#3c646c');
      shape([upper[i],upper[j],bottom[j],bottom[i]],grad,'#213c49',.6);
    }
    const face=ctx.createLinearGradient(width*.28,height*.2,width*.7,height*.78);
    face.addColorStop(0,top);face.addColorStop(.55,'#19343e');face.addColorStop(1,'#3c6369');
    shape(upper,face,edge,1.15);return ring;
  }
  function via(x,y,z,r,fill) {
    const [px,py]=project(x,y,z);
    ctx.beginPath();ctx.ellipse(px,py,r*scale,r*scale*.43,0,0,2*Math.PI);ctx.fillStyle=fill;ctx.fill();
  }
  function board(z,level) {
    const r=100;
    plate(r,z,9,level===2?'#436b73':'#2c505b','#83b8bc');
    for(let i=0;i<4;i++){
      const t=(x,y)=>[[x,y],[-y,x],[-x,-y],[y,-x]][i];
      for(let k=0;k<15;k++){
        const v=-70+k*9.6, bend=52+((k*17+i*5)%26), shift=(k%4)*2;
        const path=[[35,v*.46],[bend-13,v*.46],[bend,v*.46+13],[bend+shift,v],[91,v]];
        shape(path.map(p=>project(...t(...p),z+.4)),null,k%4?'#58818a':'#72d4cf',.65);
        via(...t(91,v),z+.6,1.25,k%4?'#8eb0b0':'#92fff4');
      }
      for(let k=0;k<14;k++){
        const p=t(97,-69+k*10);via(...p,z+.5,1.1,'#afbcad');
      }
      via(...t(88,87),z+.6,4.3,'#97b8bf');via(...t(88,87),z+1,2.6,'#1a343f');
    }
    // The thin luminous seam remains legible on both forward-facing edges.
    for(let i=0;i<4;i++){
      const nodes=[[-90,-100],[90,-100],[100,-90],[100,90],[90,100],[-90,100],[-100,90],[-100,-90]];
      const p=nodes[i*2],q=nodes[i*2+1];
      if((project(...p,z)[1]+project(...q,z)[1])/2 < project(0,0,z)[1])continue;
      ctx.save();ctx.shadowColor='#44f5ef';ctx.shadowBlur=8;
      line([...p,z-3],[...q,z-3],accent,1.7);ctx.restore();
    }
    if(level===2){
      for(let j=-28;j<=28;j+=4){
        rect(34,j,7,1.6,z+1,'#b7bda5');rect(-41,j,7,1.6,z+1,'#b7bda5');
        rect(j,34,1.6,7,z+1,'#b7bda5');rect(j,-41,1.6,7,z+1,'#b7bda5');
      }
      plate(34,z+5,4,'#192e38','#b4cbd0',4);plate(28,z+7,2,'#2f4e55','#76969d',3);
      const [o,x,y]=[[0,0],[1,0],[0,1]].map(p=>project(...p,z+7.4));
      ctx.save();ctx.transform(x[0]-o[0],x[1]-o[1],y[0]-o[0],y[1]-o[1],...o);
      ctx.font='bold 24px monospace';ctx.fillStyle='#a3fff4';ctx.textAlign='center';ctx.fillText('>_',0,7);ctx.restore();
    }
  }
  function rods(z,to) {
    for(const x of [-78,78])for(const y of [-78,78]){
      line([x,y,z],[x,y,to],'#346a76',3.2*scale);line([x,y,z],[x,y,to],'#80e1d9',1*scale);
      via(x,y,z+1,4,'#8cf6ed');via(x,y,to-2,3,'#95fff2');
    }
    for(const x of [-43,43])for(const y of [-43,43]){
      ctx.setLineDash([2,4]);line([x,y,z],[x,y,to],'#53c4c16b',.8);ctx.setLineDash([]);
    }
  }
  function draw(){
    ctx.clearRect(0,0,width,height);
    const glow=ctx.createRadialGradient(width*.5,height*.73,0,width*.5,height*.73,140*scale);
    glow.addColorStop(0,'#36e8df28');glow.addColorStop(1,'#36e8df00');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let i=-160;i<=160;i+=20){
      line([-160,i,-104],[160,i,-104],'#428f963c',.6);line([i,-160,-104],[i,160,-104],'#428f963c',.6);
    }
    const levels=[-57,8,73];
    levels.forEach((z,i)=>{board(z,i);if(i<2)rods(z+1,levels[i+1]-10);});
    if(width>355){
      const labels=[['APPLICATION',73],['API LAYER',8],['DATABASE',-57]];
      labels.forEach(([txt,z],i)=>{
        const tip=project(0,0,z);const from=[width*.5+94*scale,tip[1]+1],to=[width*.5+119*scale,tip[1]-14];
        const end=Math.min(to[0]+22*scale,width-68);
        if(end<=from[0])return;
        shape([from,to,[end,to[1]]],null,'#6d929a',.7);ctx.fillStyle='#9dfff3';ctx.fillRect(from[0]-1,from[1]-1,2,2);
        ctx.fillStyle='#9bb7c0';ctx.font='8px Plex,monospace';ctx.fillText(txt,end+4,to[1]+2);
      });
    }
  }
  function resize(){
    const box=canvas.getBoundingClientRect(),density=Math.min(devicePixelRatio||1,2);
    width=box.width;height=box.height;canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
    ctx.setTransform(density,0,0,density,0,0);
    scale=Math.min(width/372,(height-45)/265);draw();
  }
  canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,angle:yaw};canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){yaw=drag.angle+(e.clientX-drag.x)*.012;draw()}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null});
  canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();yaw+=(e.key==='ArrowLeft'?-.12:.12);draw()}});
  canvas.addEventListener('focus',()=>{if(canvas.matches(':focus-visible'))document.querySelector('#gesture').textContent='← → TO ROTATE'});
  canvas.addEventListener('blur',()=>document.querySelector('#gesture').textContent='DRAG TO ROTATE ↔');
  const observer = new ResizeObserver(resize); observer.observe(canvas); document.fonts.ready.then(() => { if (canvas.isConnected) resize(); });
  return () => observer.disconnect();
}
