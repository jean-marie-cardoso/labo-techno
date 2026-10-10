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

// Automatic, narrated excerpts. The pupils implement the real controls in Scratch.
window.mountPongDemo=function(p){
 const g=window.PongEngine();let phase=0,elapsed=0,scoredAt=null,paused=false,last=0,finished=false;
 const make=(tag,text)=>{const e=document.createElement(tag);e.textContent=text||'';return e};
 const title=make('p');title.className='demo-step';p.append(title);
 const canvas=make('canvas');canvas.width=720;canvas.height=540;canvas.className='pong-demo-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Démonstration automatique du Pong : raquettes, rebonds, score et victoire');p.append(canvas);const c=canvas.getContext('2d');
 const status=make('p');status.setAttribute('role','status');p.append(status);
 const controls=make('div');controls.className='pong-controls';p.append(controls);
 const pause=make('button','Pause'),replay=make('button','Revoir la démonstration');pause.type=replay.type='button';controls.append(pause,replay);
 function start(){g.start();phase=0;elapsed=0;scoredAt=null;finished=false;paused=false;paint()}
 function setPhase(n){phase=n;elapsed=0;scoredAt=null;g.start();if(n===1){g.y=[140,0];g.x=0;g.bY=-85;g.vx=-180;g.vy=0;g.delay=1}else if(n===2){g.score=[4,4];g.y=[0,140];g.bY=-85;g.vx=180;g.vy=0;g.delay=2}}
 function step(dt){if(paused||finished)return;elapsed+=dt;
  if(phase===0){for(let i=0;i<2;i++){const target=g.bY;g.y[i]+=Math.max(-190*dt,Math.min(190*dt,target-g.y[i]));g.y[i]=Math.max(-140,Math.min(140,g.y[i]))}g.step(dt);if(elapsed>=10)setPhase(1)}
  else {if(scoredAt===null){g.step(dt);if((phase===1&&g.score[1]===1)||(phase===2&&g.ended))scoredAt=elapsed}else if(phase===1&&elapsed-scoredAt>3)setPhase(2);else if(phase===2&&elapsed-scoredAt>3)finished=true}
 }
 function paint(){c.fillStyle='#132b3c';c.fillRect(0,0,720,540);c.strokeStyle='#708998';c.setLineDash([10,10]);c.beginPath();c.moveTo(360,0);c.lineTo(360,540);c.stroke();c.setLineDash([]);c.fillStyle='#fff';c.fillRect(0,0,720,3);c.fillRect(0,537,720,3);c.font='bold 32px system-ui';c.textAlign='center';c.fillText('J1 : '+g.score[0],205,42);c.fillText('J2 : '+g.score[1],515,42);
  for(let i=0;i<2;i++){c.fillStyle=i?'#ffbc70':'#70d4ef';c.fillRect(360+(i?210:-210)*1.5-9,270-g.y[i]*1.5-60,18,120)}
  c.fillStyle='#fff';c.beginPath();c.arc(360+g.x*1.5,270-g.bY*1.5,9,0,Math.PI*2);c.fill();
  let banner=paused?'Pause':g.ended?'J1 gagne : 5 points !':g.delay>0?'Retour au centre':'';
  if(banner){c.fillStyle='#132b3cf0';c.fillRect(130,225,460,80);c.fillStyle='#fff';c.font='bold 25px system-ui';c.fillText(banner,360,273)}
  title.textContent=['1 / 3 · Les échanges','2 / 3 · Un seul point par sortie','3 / 3 · La fin de partie'][phase];
  const txt=phase===0?'Les raquettes bougent automatiquement. La balle rebondit en haut, en bas et sur les raquettes.':phase===1?(scoredAt===null?'La raquette gauche manque la balle. Observez qui marque.':'Sortie à gauche : J2 gagne 1 point. La balle revient au centre.'):(scoredAt===null?'Extrait de fin de manche : on reprend à 4–4. La balle va sortir à droite.':'Sortie à droite : J1 atteint 5. Le jeu s’arrête et annonce le gagnant.');
  if(status.textContent!==txt)status.textContent=txt;pause.textContent=paused?'Reprendre':'Pause';pause.disabled=finished;canvas.dataset.demo=JSON.stringify({phase,elapsed,paused,finished,x:g.x,y:g.bY,paddles:g.y,score:g.score});
 }
 pause.onclick=()=>{paused=!paused;paint()};replay.onclick=start;
 start();if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)paused=true;
 function frame(t){if(!p.isConnected)return;const dt=Math.min((t-last)/1000||0,.05);last=t;step(dt);paint();requestAnimationFrame(frame)}requestAnimationFrame(frame);
};
