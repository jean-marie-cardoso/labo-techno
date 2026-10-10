'use strict';
window.PongEngine=function(){
 const g={y:[0,0],score:[0,0],x:0,bY:0,vx:180,vy:100,running:false,ended:false,delay:0,resetScores:true};
 g.start=()=>{g.y=[0,0];if(g.resetScores)g.score=[0,0];g.running=true;g.ended=false;g.serve(1)};
 g.serve=d=>{g.x=0;g.bY=0;g.vx=180*d;g.vy=100;g.delay=1};
 g.point=i=>{if(!g.running)return;g.score[i]++;if(g.score[i]>=5){g.running=false;g.ended=true}else g.serve(i===0?1:-1)};
 g.step=(dt,keys=new Set())=>{if(!g.running)return;dt=Math.min(dt,.05);for(let i=0;i<2;i++){let up=i?'ArrowUp':'z',down=i?'ArrowDown':'s';g.y[i]=Math.max(-140,Math.min(140,g.y[i]+((keys.has(up)?1:0)-(keys.has(down)?1:0))*240*dt))}if(g.delay>0){g.delay=Math.max(0,g.delay-dt);return}g.x+=g.vx*dt;g.bY+=g.vy*dt;if(g.bY>174){g.bY=174;g.vy=-Math.abs(g.vy)}if(g.bY< -174){g.bY=-174;g.vy=Math.abs(g.vy)}
 if(g.vx<0&&g.x<=-198&&g.x>=-220&&Math.abs(g.bY-g.y[0])<46){g.x=-198;g.vx=Math.abs(g.vx)}
 if(g.vx>0&&g.x>=198&&g.x<=220&&Math.abs(g.bY-g.y[1])<46){g.x=198;g.vx=-Math.abs(g.vx)}
 if(g.x< -230)g.point(1);else if(g.x>230)g.point(0);
 };return g;
};
window.mountPong=function(p,debug=false){
 const g=window.PongEngine(),keys=new Set();let paused=false,last=0;
 const make=(tag,txt)=>{const x=document.createElement(tag);if(txt)x.textContent=txt;return x};
 const btn=(text,fn,parent=p)=>{const b=make('button',text);b.type='button';b.onclick=fn;parent.append(b);return b};
 const intro=make('p','J1 à gauche : Z pour monter, S pour descendre. J2 à droite : flèches ↑ et ↓. Une balle sortie donne un point à l’adversaire. Le premier à 5 gagne.');p.append(intro);
 const cv=make('canvas');cv.width=960;cv.height=720;cv.tabIndex=0;cv.className='pong-canvas';cv.setAttribute('aria-label','Pong à deux joueurs, raquette gauche Z S, raquette droite flèches haut bas');p.append(cv);const c=cv.getContext('2d');
 const out=make('p');out.className='pong-status';out.setAttribute('role','status');p.append(out);
 const controls=make('div');controls.className='pong-controls';p.append(controls);
 btn('Nouvelle partie',()=>{g.start();paused=false;keys.clear();cv.focus()},controls);
 const pause=btn('Pause',()=>{if(g.running){paused=!paused;keys.clear();pause.textContent=paused?'Reprendre':'Pause';cv.focus()}},controls);
 for(const [label,key] of [['J1 ↑','z'],['J1 ↓','s'],['J2 ↑','ArrowUp'],['J2 ↓','ArrowDown']]){let b=btn(label,()=>{},controls);b.style.touchAction='none';b.onpointerdown=e=>{keys.add(key);b.setPointerCapture(e.pointerId)};b.onpointerup=b.onpointercancel=()=>keys.delete(key);b.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();keys.add(key)}};b.onkeyup=()=>keys.delete(key)}
 cv.addEventListener('keydown',e=>{let k=e.key.length===1?e.key.toLowerCase():e.key;if(['z','s','ArrowUp','ArrowDown'].includes(k)){e.preventDefault();keys.add(k)}});
 window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
 cv.addEventListener('blur',()=>keys.clear());window.addEventListener('blur',()=>{keys.clear();if(g.running){paused=true;pause.textContent='Reprendre'}});
 if(debug){let details=make('details');details.className='pong-debug';details.append(make('summary','Q2 Atelier de débogage du score'));p.append(details);details.append(make('p','La balle est sortie à droite et reste dehors. Clique trois fois sur « Lire la sortie ». Compare les deux réglages, puis explique comment recentrer la balle évite plusieurs points.'));
 let mode=make('select');mode.setAttribute('aria-label','Comptage de la sortie');for(const [v,t] of [['once','Un seul point puis recentrage'],['repeat','Un point à chaque lecture']]){let op=make('option',t);op.value=v;mode.append(op)}details.append(mode);let points=0,inside=false;let report=make('p');const reset=()=>{points=0;inside=false;report.textContent='Balle sortie à droite. Score J1 : 0.'};btn('Replacer la balle dehors',reset,details);btn('Lire la sortie',()=>{if(!inside){points++;if(mode.value==='once')inside=true}report.textContent=`Score J1 : ${points}. Balle ${inside?'recentrée':'encore dehors'}.`},details);details.append(report);mode.onchange=reset;reset();
 let label=make('label'),check=make('input');check.type='checkbox';check.checked=true;check.onchange=()=>g.resetScores=check.checked;label.append(check,document.createTextNode(' Remettre les scores à zéro à « Nouvelle partie »'));details.append(label);details.append(make('p','Joue, marque un point, puis compare une relance avec et sans remise à zéro.'));
 }
 function paint(){c.fillStyle='#132b3c';c.fillRect(0,0,960,720);c.strokeStyle='#7692a1';c.setLineDash([15,15]);c.beginPath();c.moveTo(480,0);c.lineTo(480,720);c.stroke();c.setLineDash([]);c.fillStyle='#fff';c.fillRect(0,0,960,3);c.fillRect(0,717,960,3);c.font='bold 48px Arial';c.textAlign='center';c.fillText(g.score[0],320,70);c.fillText(g.score[1],640,70);['#70d4ef','#ffbc70'].forEach((color,i)=>{c.fillStyle=color;c.fillRect((i?210:-210)*2+480-12,360-g.y[i]*2-80,24,160)});c.fillStyle='#fff';c.beginPath();c.arc(g.x*2+480,360-g.bY*2,12,0,7);c.fill();let message=paused?'Pause':g.ended?'Joueur '+(g.score[0]>=5?1:2)+' gagne !':!g.running?'Pong à deux':g.delay>0?'Service…':'';if(message){c.fillStyle='#132b3ce8';c.fillRect(165,290,630,105);c.fillStyle='#fff';c.font='bold 38px Arial';c.fillText(message,480,355)}let text=`J1 : ${g.score[0]} · J2 : ${g.score[1]}. ${message||'Partie en cours.'}`;if(out.textContent!==text)out.textContent=text;cv.dataset.state=JSON.stringify(g);pause.textContent=paused?'Reprendre':'Pause'}
 function frame(t){if(!p.isConnected)return;let dt=Math.min((t-last)/1000||0,.05);last=t;if(!paused)g.step(dt,keys);paint();requestAnimationFrame(frame)}requestAnimationFrame(frame);return g;
};
if(window.projectWidgets)window.projectWidgets.gameBench=function(p){window.mountPong(p,true);const a=document.createElement('a');a.href='../4-01/#aides';a.textContent='Ouvrir les aides du projet Pong';p.append(a)};
