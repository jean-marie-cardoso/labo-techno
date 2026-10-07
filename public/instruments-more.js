'use strict';
(()=>{
const T=window.instrumentTools,{setup,note,help,choices,text,ticks}=window.instrumentHelpers;
Object.assign(T,{
replacement(p,c){
 p.classList.add('replacement-bench');
 const b=setup(p,'Maquette d’hélice posée sur un support remplaçable, avec une charge et une règle');b.drawing.setAttribute('viewBox','0 0 900 430');
 let installed='damaged',fixed=true,loaded=false;
 const measure=E('div',undefined,'replacement-step'),repair=E('div',undefined,'replacement-step');b.controls.append(measure,repair);
 measure.append(E('h3','1. Faire un essai'));
 const load=button(measure,'Poser la charge d’essai',()=>{loaded=!loaded;draw()});
 const ruler=select(measure,'Placer la règle',[['away','Règle rangée'],['middle','Au repère central'],['left','Sur l’appui gauche']]);
 measure.append(E('p','Mesure avant le remplacement, puis après. Garde la même charge et le même point de mesure. Note tes relevés sur papier.','hint'));
 repair.append(E('h3','2. Remplacer la pièce'));
 const part=select(repair,'Pièce saine à essayer',c.parts.map((x,i)=>[String(i),x[0]]));
 const remove=button(repair,'Déposer l’hélice et retirer le support',()=>{installed=null;fixed=false;draw()});
 const place=button(repair,'Placer la pièce choisie',()=>{installed=+part.value;fixed=false;draw()});
 const fasten=button(repair,'Fixer la pièce et reposer l’hélice',()=>{fixed=true;draw()});
 repair.append(E('p','Retire d’abord la charge. Après le remplacement, refais un essai avec les commandes de l’étape 1.','hint'));
 const reset=button(p,'Repartir du support endommagé',()=>{installed='damaged';fixed=true;loaded=false;part.value='0';ruler.value='away';draw()});reset.classList.add('secondary');
 const blade=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-12 50L-24 76H24L12 50" fill="#869ba2" stroke="#405d68" stroke-width="3"/><circle r="54" fill="#ecf3ef" stroke="#698c89" stroke-width="4"/><g fill="#458e83" stroke="#285b55" stroke-width="2"><path d="M0 0C-16-24-9-51 11-45C32-42 40-24 17-13Z"/><path d="M0 0C-16-24-9-51 11-45C32-42 40-24 17-13Z" transform="rotate(120)"/><path d="M0 0C-16-24-9-51 11-45C32-42 40-24 17-13Z" transform="rotate(240)"/></g><circle r="9" fill="#4c6268"/></g>`;
 function draw(){
  const present=installed!==null,damaged=installed==='damaged',displacement=loaded?(damaged?16:c.parts[installed][1]):0,dy=displacement*3;
  load.disabled=!present||!fixed;load.textContent=loaded?'Retirer la charge d’essai':'Poser la charge d’essai';remove.disabled=!present||loaded;place.disabled=present;fasten.disabled=!present||fixed;part.disabled=present||loaded;
  const name=!present?'Support retiré':damaged?'Support endommagé':c.parts[installed][0];
  const color=damaged?'#be9870':installed===2?'#94b6cb':'#cbb184';
  let picture=`<rect x="15" y="20" width="870" height="385" rx="16" fill="#f7f8f4"/><path d="M42 350H858" stroke="#9caea7" stroke-width="5"/>
  <path d="M140 342V236H180V342M470 342V236H510V342" fill="#a1b2b9" stroke="#536f7b" stroke-width="3"/>
  <text x="48" y="53" style="font-size:21px">Maquette hors tension</text>
  <text x="82" y="387" style="font-size:20px">${name}${present&&!fixed?' · non fixée':''}</text>
  <text x="636" y="54" style="font-size:19px">Pièces déposées sur le banc</text>`;
  if(present){
   picture+=`<path d="M148 231Q325 ${231+2*dy} 502 231L502 243Q325 ${243+2*dy} 148 243Z" fill="${color}" stroke="#796447" stroke-width="3"/>`;
   if(installed===1)picture+=`<path d="M154 243Q325 ${255+2*dy} 496 243" fill="none" stroke="#796447" stroke-width="4"/>`;
   if(damaged)picture+=`<path d="M272 ${231+dy*.85}l9 8-7 4 8 8" fill="none" stroke="#6d4233" stroke-width="4"/><path d="M222 182L271 ${224+dy*.85}" stroke="#8a5040" stroke-width="2"/><text x="164" y="177" style="font-size:18px">Pli visible</text>`;
   if(fixed)picture+=`<g stroke="#364e57" stroke-width="3"><circle cx="164" cy="233" r="6" fill="#dbe2df"/><path d="M161 233h6"/><circle cx="486" cy="233" r="6" fill="#dbe2df"/><path d="M483 233h6"/></g>`;
   if(fixed)picture+=blade(325,155+dy);else picture+=blade(741,234);
   if(loaded)picture+=`<g transform="translate(376 ${196+dy*.87})"><path d="M10 0V-8Q27-23 43-8V0" fill="none" stroke="#4c5865" stroke-width="5"/><rect width="54" height="37" rx="5" fill="#67798b" stroke="#334659" stroke-width="3"/></g><text x="412" y="119" style="font-size:18px">Même charge</text><path d="M442 129L411 ${188+dy*.87}" stroke="#6c7c82" stroke-width="2"/>`;
   picture+=`<circle cx="325" cy="${243+dy}" r="5" fill="#bd5b32"/><text x="206" y="319" style="font-size:18px">Repère central</text><path d="M297 307L323 ${250+dy}" stroke="#9d6646" stroke-width="2"/>`;
  }else{picture+=blade(741,234);picture+='<path d="M637 325l105-9 17 10 63-7v12l-69 7-18-9-98 9Z" fill="#be9870" stroke="#796447" stroke-width="3"/>';}
  if(present&&fixed)picture+='<text x="652" y="160" style="font-size:18px">L’hélice reste immobile.</text><text x="652" y="188" style="font-size:18px">On teste le support.</text>';
  const reading=ruler.value==='middle'?displacement:0;
  if(ruler.value!=='away'&&present){
   const x=ruler.value==='middle'?550:85;
   picture+=`<path d="M${ruler.value==='middle'?325:164} 243H${x+21}" stroke="#75857d" stroke-width="1.5" stroke-dasharray="5 5"/><rect x="${x}" y="230" width="50" height="96" rx="3" fill="#f4dfa1" stroke="#967e4d" stroke-width="2"/>`;
   for(let n=0;n<=20;n++){const y=243+n*3;picture+=`<path d="M${x} ${y}h${n%5===0?17:8}" stroke="#685830"/>`;if(n%5===0)picture+=`<text x="${x+20}" y="${y+5}" style="font-size:13px">${n}</text>`;}
   picture+=`<path d="M${x-12} ${243+reading*3}h30" stroke="#b64d30" stroke-width="3"/><text x="${x}" y="347" style="font-size:17px">mm</text>`;
  }
  b.drawing.innerHTML=picture;
  b.screen.textContent=!present?'SANS SUPPORT':!fixed?'PIÈCE NON FIXÉE':ruler.value==='away'?'RÈGLE RANGÉE':fmt(reading)+' mm';
  b.status.textContent=!present?'Choisis une pièce saine, puis place-la sur les deux appuis.':!fixed?'La pièce est posée. Fixe-la et repose l’hélice avant de charger.':loaded?'Charge posée. Place la règle et relève le déplacement. Retire la charge avant de démonter.':damaged?'Support endommagé. Fais ton relevé avant le remplacement.':'Pièce remplacée. Refais l’essai avec la même charge et le même point de mesure.';
  b.drawing.setAttribute('aria-label',`Support d’hélice : ${name}. ${fixed?'Fixations en place.':'Sans fixation.'} ${loaded?'Charge posée.':'Sans charge d’essai.'} ${ruler.value==='away'?'Règle rangée.':'Règle '+(ruler.value==='middle'?'au repère central':'sur l’appui gauche')+'. Lecture : '+b.screen.textContent}`);
 }
 ruler.addEventListener('change',draw);part.addEventListener('change',draw);draw();
 help(p,'Prépare sur papier un tableau « Pièce / Charge / Point mesuré / Déplacement (mm) ». La règle mesure le déplacement par rapport à la position sans charge : 0 mm. Relève avant et après, sans changer le point mesuré. Utilise ensuite la balance pour la masse. Compare toi-même aux exigences de Q1 et Q5.');
 note(p,'Essai scolaire fictif : la lecture du support endommagé est une donnée supplémentaire de simulation. Les pièces saines reprennent les valeurs du tableau de Q1, sous la charge prévue. La déformation du dessin est amplifiée. La simulation teste seulement le support ; elle ne valide ni le geste réel ni le fonctionnement de l’hélice.');
},

bottleLeak(p,c){
 const b=setup(p,'Gourde, joint et récipient gradué pour recueillir une fuite');b.drawing.setAttribute('viewBox','0 0 640 420');
 const cap=select(b.controls,'Forme du bouchon',[['smooth','Lisse'],['winged','À ailettes']]),seal=select(b.controls,'Joint',[['none','Sans joint'],['good','Bien placé'],['misplaced','Mal placé']]),closure=select(b.controls,'Fermeture',[['closed','Complètement vissée'],['partial','Partiellement vissée']]),position=select(b.controls,'Position pendant l’essai',[['180','Retournée'],['90','Couchée'],['0','Debout']]),trial=select(b.controls,'Essai',[['0','1'],['1','2'],['2','3']]);
 const inputs=[cap,seal,closure,position,trial];let start=null,raf=null,progress=0,result=null;
 // Fictitious classroom data, not a physical prediction. Grip shape does not alter the seal.
 const volume=()=>{const i=+trial.value;let v=c.volumes[seal.value][i]+(closure.value==='partial'?c.volumes.partial[i]:0);return Math.round(v*(+position.value/180))};
 const draw=()=>{
  const running=start!==null,angle=+position.value*(running||result!==null?Math.min(1,progress*5):0),rad=angle*Math.PI/180;
  const x=220-72*Math.sin(rad),y=110-72*Math.cos(rad),v=result===null?volume()*progress:result,waterY=381-v*3;
  const wings=cap.value==='winged'?'<path d="M184 33h-23v16h23M256 33h23v16h-23" fill="#487b88" stroke="#294f59" stroke-width="3"/>':'';
  b.drawing.innerHTML='<g data-bottle="'+cap.value+'" transform="rotate('+(-angle)+' 220 110)"><path d="M190 54V71Q165 82 165 104V165Q165 190 220 190Q275 190 275 165V104Q275 82 250 71V54Z" fill="#a8ced3" stroke="#345f68" stroke-width="3"/><defs><clipPath id="leak-water-body"><path d="M193 57V73Q168 84 168 104V164Q168 187 220 187Q272 187 272 164V104Q272 84 247 73V57Z"/></clipPath></defs><g clip-path="url(#leak-water-body)"><g transform="rotate('+angle+' 220 110)"><rect x="100" y="108" width="250" height="160" fill="#67b5d280"/></g></g><path d="M183 106v54" stroke="#ecf8f6" stroke-width="8" stroke-linecap="round"/>'+
   (seal.value==='none'?'':'<ellipse data-seal="'+seal.value+'" cx="220" cy="56" rx="32" ry="6" fill="none" stroke="#c57832" stroke-width="5" transform="rotate('+(seal.value==='misplaced'?17:0)+' 220 56)"/>')+
   '<g transform="translate(0 '+(closure.value==='partial'?-9:0)+')">'+wings+'<rect x="184" y="30" width="72" height="23" rx="7" fill="#487b88" stroke="#294f59" stroke-width="3"/><ellipse cx="220" cy="31" rx="36" ry="7" fill="#83b1bb" stroke="#294f59" stroke-width="2"/></g></g>'+
   '<path d="M90 222H360L235 262V276H215V262Z" fill="#dce5e6" stroke="#557471" stroke-width="3"/>'+
   (running&&v>0&&progress>.2?'<path d="M'+x+' '+y+'Q'+(x-12)+' 210 205 226M225 265V'+Math.max(280,waterY)+'" fill="none" stroke="#439bc5" stroke-width="4" stroke-dasharray="7 7" stroke-dashoffset="'+(-progress*160)+'"/>':'')+
   '<path d="M175 280V380Q225 398 275 380V280" fill="#eff9fb" stroke="#527679" stroke-width="3"/>'+
   (v>0?'<path d="M178 '+waterY+'H272V379Q225 393 178 379Z" fill="#77c1de"/>':'')+
   '<g stroke="#345e65">'+Array.from({length:31},(_,i)=>'<path d="M'+(i%5?258:248)+' '+(381-i*3)+'H273"/>'+(i%5?'':text(280,386-i*3,String(i),14))).join('')+'</g>'+
   text(316,315,'mL',20)+text(375,60,'500 mL au départ',20)+text(375,92,'Essai de 20 s',20)+text(375,132,'Joint : '+seal.selectedOptions[0].text,18)+text(375,164,closure.value==='closed'?'Bouchon fermé':'Fermeture partielle',18)+text(375,205,'Temps simulé',18)+text(410,240,(progress*20).toFixed(0)+' s',26)+text(375,345,'Eau recueillie',20);
  b.screen.textContent=result===null?(running?'Essai en cours…':'Prêt pour un essai'):result+' mL';
  const status=running?'Observe l’eau et le récipient. Les réglages restent fixes pendant l’essai.':result===null?'Choisis tes réglages. Chaque essai repart avec 500 mL et un récipient vide.':'Relève le volume et les réglages sur papier. Change un seul élément pour comparer.';
  if(b.status.textContent!==status)b.status.textContent=status;
 };
 const tick=()=>{progress=Math.min(1,(performance.now()-start)/5000);if(progress===1){result=volume();start=null;inputs.forEach(e=>e.disabled=false);launch.disabled=false;raf=null}else raf=requestAnimationFrame(tick);draw()};
 const reset=()=>{if(raf!==null)cancelAnimationFrame(raf);raf=null;start=null;progress=0;result=null;inputs.forEach(e=>e.disabled=false);launch.disabled=false;draw()};
 const launch=button(b.controls,'Lancer l’essai de 20 s',()=>{reset();start=performance.now();inputs.forEach(e=>e.disabled=true);launch.disabled=true;raf=requestAnimationFrame(tick);draw()});
 button(b.controls,'Vider et préparer un nouvel essai',reset);inputs.forEach(e=>e.addEventListener('change',reset));draw();
 help(p,'Pour Q3 : bouchon lisse, complètement vissé, gourde retournée. Compare sans joint et joint bien placé, avec les essais 1, 2 et 3. Lis le volume en mL. Teste ensuite le joint mal placé. Garde tes relevés et conclusions sur papier.');
 note(p,'Modèle fictif : 20 s sont représentées en 5 s. Petites graduations : 1 mL. La forme de la prise ne change pas le volume dans ce modèle. Ni les chocs ni l’effort d’ouverture ne sont simulés. Une lecture de 0 mL ne prouve pas l’absence de toute fuite réelle.');
},

stopwatch(p,c){
 const b=setup(p,'Chronomètre et mouvement à observer'),which=choices(b.controls,'Objet / configuration',c.samples),trial=select(b.controls,'Essai',[['0','1'],['1','2'],['2','3']]);
 let eventStart=null,eventDuration=0,clockStart=null,elapsed=0,raf=null;
 const now=()=>performance.now()/1000;
 const time=()=>elapsed+(clockStart===null?0:now()-clockStart);
 // One shared timestamp: the movement and measurement start together.
 const bottle=(progress)=>{
  const winged=/ailettes/i.test(c.samples[+which.value][0]),unscrew=Math.min(1,progress/.78),lift=Math.max(0,(progress-.78)/.22),angle=unscrew*Math.PI*6;
  const capX=460+lift*85,capY=89-unscrew*16-lift*39,wingWidth=15+25*Math.abs(Math.cos(angle));
  return '<g data-bottle="'+(winged?'winged':'smooth')+'"><ellipse cx="460" cy="277" rx="64" ry="9" fill="#314b4920"/>'+
   '<path d="M427 107V132Q403 143 400 167V250Q400 276 460 276Q520 276 520 250V167Q517 143 493 132V107Z" fill="#8fbfc7" stroke="#345f68" stroke-width="3"/>'+
   '<path d="M412 171V247Q412 257 424 259V163" fill="#c8e6e8"/><path d="M502 165V254" stroke="#659ba5" stroke-width="8" stroke-linecap="round"/>'+
   '<rect x="431" y="188" width="58" height="41" rx="12" fill="#e5f1ec"/><path d="M460 195Q440 216 460 222Q480 216 460 195" fill="#5b99a6"/>'+
   '<ellipse cx="460" cy="107" rx="33" ry="8" fill="#294b51" stroke="#345f68" stroke-width="3"/><path d="M428 115Q460 124 492 115M428 122Q460 131 492 122" fill="none" stroke="#d5e9e5" stroke-width="2"/>'+
   '<g data-cap="'+(winged?'winged':'smooth')+'" transform="translate('+capX+' '+capY+') rotate('+(lift*18)+')">'+
   (winged?'<path d="M-36 -8L-'+(36+wingWidth)+' -18Q-'+(43+wingWidth)+' -12 -'+(36+wingWidth)+' 10L-36 16M36 -8L'+(36+wingWidth)+' -18Q'+(43+wingWidth)+' -12 '+(36+wingWidth)+' 10L36 16" fill="#3f717d" stroke="#294f59" stroke-width="3"/>':'')+
   '<path d="M-37 -9V16C-37 29 37 29 37 16V-9Z" fill="#487b88" stroke="#294f59" stroke-width="3"/><ellipse cy="-9" rx="37" ry="10" fill="#83b1bb" stroke="#294f59" stroke-width="3"/>'+
   (Math.cos(angle)>=0?'<path d="M'+(28*Math.sin(angle))+' 1v15" stroke="#d9efef" stroke-width="4" stroke-linecap="round"/>':'')+'</g></g>';
 };
 const draw=()=>{const progress=eventStart===null?0:Math.min(1,(now()-eventStart)/eventDuration);let scene='';
 if(c.scene==='shutter')scene='<rect x="365" y="30" width="210" height="225" fill="#dce9ee" stroke="#4d6265" stroke-width="8"/><rect x="370" y="35" width="200" height="'+(215*(1-progress))+'" fill="#819393"/>';
 else if(c.scene==='traffic')scene='<rect x="405" y="30" width="120" height="245" rx="15" fill="#384a46"/><circle cx="465" cy="100" r="40" fill="'+(progress===1||eventStart===null?'#c24740':'#75837a')+'"/><circle cx="465" cy="205" r="40" fill="'+(progress<1&&eventStart!==null?'#47a878':'#75837a')+'"/>';
 else scene=bottle(progress);
 const reading=time().toFixed(1).replace('.',',')+' s';
 b.drawing.innerHTML='<rect x="134" y="18" width="44" height="30" rx="7" fill="#738c85"/><circle cx="157" cy="171" r="116" fill="#3d5553" stroke="#253b3a" stroke-width="8"/><rect x="70" y="130" width="176" height="65" rx="9" fill="#c4d6ae"/>'+text(86,172,reading,26)+scene+text(340,315,eventStart===null?'Prêt':progress===1?c.endLabel:'Mouvement en cours',18);
 b.drawing.setAttribute('aria-label',c.scene==='bottle'?c.samples[+which.value][0]+' : '+(eventStart===null?'fermé':progress===1?'retiré':'ouverture en cours'):'Chronomètre et mouvement à observer');
 b.screen.textContent=reading;
 const status=eventStart===null?'Un seul clic lance le mouvement et le chronomètre.':clockStart===null?'Mesure arrêtée. Note ta durée sur papier ; prépare un nouvel essai pour recommencer.':progress===1?c.endLabel+' — arrête le chronomètre.':'Observe le mouvement. Arrête le chronomètre à l’événement final.';
 if(b.status.textContent!==status)b.status.textContent=status;
 stop.disabled=clockStart===null;
 if(clockStart!==null||(eventStart!==null&&progress<1))raf=requestAnimationFrame(draw);else raf=null;};
 const refresh=()=>{if(raf!==null)cancelAnimationFrame(raf);draw()};
 const launch=button(b.controls,'Lancer le mouvement et le chronomètre',()=>{eventDuration=c.samples[+which.value][1][+trial.value];elapsed=0;eventStart=clockStart=now();which.disabled=true;trial.disabled=true;launch.disabled=true;refresh()});
 const stop=button(b.controls,'Arrêter le chronomètre',()=>{if(clockStart!==null){elapsed=time();clockStart=null;refresh()}});
 const reset=()=>{eventStart=null;eventDuration=0;elapsed=0;clockStart=null;which.disabled=false;trial.disabled=false;launch.disabled=false;refresh()};
 button(b.controls,'Préparer un nouvel essai',reset);
 which.addEventListener('change',reset);trial.addEventListener('change',reset);draw();
 help(p,'Prépare ton tableau sur papier. Choisis une configuration et un essai. Le bouton de lancement démarre en même temps le mouvement et le chronomètre. Arrête le chronomètre à l’événement final. Relève la durée, puis prépare un nouvel essai.');note(p,'Temps réel du navigateur, à 0,1 s près. Les durées du mouvement viennent du dossier. Le départ est synchronisé ; ton clic d’arrêt influence la mesure. Le chronomètre ne s’arrête pas automatiquement. Garde cet onglet visible pendant l’essai.');
},
volume(p,c){
 const b=setup(p,'Récipient gradué transparent avec ménisque'),sample=choices(b.controls,'Bac à contrôler',c.items),upright=toggle(b.controls,'Récipient vertical sur table horizontale',true),eye=select(b.controls,'Hauteur des yeux',[['low','En dessous du liquide'],['level','Au niveau du ménisque'],['high','Au-dessus du liquide']]);let vol=0;
 const draw=()=>{const top=35,bottom=290,k=.45,y=bottom-vol*k,apparent=y+(eye.value==='high'?-9:eye.value==='low'?9:0);b.drawing.innerHTML='<g transform="rotate('+(upright.checked?0:9)+' 300 290)"><path d="M200 35V280Q300 310 400 280V35" fill="#e6f2f344" stroke="#6c8585" stroke-width="5"/>'+(vol?'<path d="M204 '+(y-5)+'Q300 '+(y+5)+' 396 '+(y-5)+'V278Q300 305 204 278Z" fill="#69b4da88"/>':'')+'<g stroke="#486b71">'+Array.from({length:51},(_,i)=>{const yy=bottom-i*10*k;return '<path d="M350 '+yy+'h'+(i%5===0?44:20)+'"/>'+(i%10===0?text(280,yy+5,String(i*10),16):'')}).join('')+'</g></g><path d="M425 '+apparent+'H580" stroke="#ac5f3c" stroke-dasharray="5 4" stroke-width="2"/>'+text(433,apparent-12,'Regard',16)+text(200,325,'Graduations en mL · bas du ménisque',17);b.screen.textContent=vol?'Lecture sur la graduation':'Récipient vide';b.status.textContent='Inscris le volume en mL, puis convertis en L sur ta feuille.'};
 button(b.controls,'Recueillir l’eau de ce bac',()=>{if(!upright.checked){b.status.textContent='Redresse le récipient avant de recueillir l’eau.';return}vol=c.items[+sample.value][1];draw()});button(b.controls,'Vider le récipient',()=>{vol=0;draw()});sample.addEventListener('change',()=>{vol=0;draw()});on([upright,eye],draw);help(p,'Pose le récipient vertical. Recueille l’eau d’un seul bac. Place tes yeux au niveau de la surface et lis le bas du ménisque. Une petite graduation vaut 10 mL. Vide entre deux bacs.');note(p,'Volumes issus du dossier. Le trait de regard montre l’effet de sa position ; il ne change pas la quantité d’eau. Les comparaisons aux limites restent sur papier.');
},
temperature(p,c){
 const b=setup(p,'Thermomètre à sonde placé dans une salle'),sample=choices(b.controls,'Situation du dossier',c.items),place=select(b.controls,'Placer la sonde',[['room','Au centre de la salle'],['window','Contre la fenêtre'],['heater','Près d’une source chaude']]),power=toggle(b.controls,'Allumer le thermomètre');let start=0,raf=null;
 const draw=()=>{const x={room:320,window:140,heater:500}[place.value];b.drawing.innerHTML='<rect x="90" y="30" width="460" height="255" fill="#f0eee6" stroke="#8a9c95"/><rect x="108" y="65" width="90" height="100" fill="#d7ecf4" stroke="#6b939e"/><path d="M153 65V165M108 115H198" stroke="#6b939e"/><rect x="454" y="185" width="78" height="70" fill="#d2a791"/><path d="M'+x+' 85V220" stroke="#637d7b" stroke-width="10"/><circle cx="'+x+'" cy="220" r="15" fill="#b85d4d"/>'+text(160,320,'Sonde mobile · même lieu pour comparer',17)};
 const read=()=>{const d=(performance.now()-start)/1000;const target=c.items[+sample.value][1]+({room:0,window:-3,heater:8}[place.value]);b.screen.textContent=(d>=3?target:20+(target-20)*d/3).toFixed(1).replace('.',',')+' °C';b.status.textContent=d>=3?'Lecture stabilisée dans le modèle. Relève le lieu et la température.':'La sonde se stabilise…';if(d<3)raf=requestAnimationFrame(read);else raf=null};
 const reset=()=>{if(raf!==null)cancelAnimationFrame(raf);raf=null;b.screen.textContent=power.checked?'—':'ÉTEINT';b.status.textContent='Choisis le lieu, puis lance une lecture stabilisée.';draw()};on([sample,place,power],reset);button(b.controls,'Attendre une lecture stabilisée',()=>{if(!power.checked)return;if(raf!==null)cancelAnimationFrame(raf);start=performance.now();read()});help(p,'Place la sonde au lieu à étudier, allume l’appareil et attends une valeur stable. Pour comparer plusieurs essais, garde le lieu et les conditions identiques.');note(p,'Modèle pédagogique : stabilisation en 3 s. Les valeurs au centre viennent du dossier ; les écarts près de la fenêtre ou du chauffage sont fictifs.');
},
flexmeter(p,c){
 const b=setup(p,'Éprouvette sur deux appuis et comparateur de déplacement'),form=choices(b.controls,'Forme de l’éprouvette',c.forms),load=range(b.controls,c.factor?'Facteur de charge':'Charge (N)',0,c.max,c.max,c.step||1),span=c.cubic?range(b.controls,'Portée (mm)',50,100,100,10):null,applied=toggle(b.controls,'Poser la charge'),probe=select(b.controls,'Placer le palpeur',[['middle','Au centre de l’éprouvette'],['support','Sur un appui'],['away','Hors de l’éprouvette']]);let zero=0;
 const displacement=()=>applied.checked?c.forms[+form.value][1]*+load.value*(span?(+span.value/100)**3:1):0;
 const measured=()=>probe.value==='middle'?displacement():0;
 const draw=()=>{const d=displacement(),y=130+Math.min(100,d*6),x=probe.value==='middle'?320:probe.value==='support'?100:560,probeY=probe.value==='middle'?y:130;b.drawing.innerHTML='<path d="M70 240L100 130L130 240 M510 240L540 130L570 240" fill="#aa9580"/><path d="M100 130Q320 '+(130+Math.min(200,d*12))+' 540 130" stroke="#637b78" stroke-width="8" fill="none"/>'+(applied.checked?'<rect x="295" y="'+(y-34)+'" width="50" height="30" fill="#b18b61"/>':'')+'<path d="M'+x+' 25V'+probeY+'" stroke="#526c79" stroke-width="5"/><rect x="'+(x-48)+'" y="25" width="96" height="44" rx="6" fill="#c3d4bb" stroke="#4c6552"/>'+text(70,300,'Déformation amplifiée · comparer au zéro initial',17);b.screen.textContent=probe.value==='away'?'SANS CONTACT':fmt(Math.round((measured()-zero)*10000)/10000)+' mm';b.status.textContent='Lecture de déplacement après le dernier zéro. Aucun verdict de résistance.'};
 button(b.controls,'Faire le zéro du comparateur',()=>{if(probe.value!=='away'){zero=measured();draw()}});on([form,load,...(span?[span]:[]),applied,probe],draw);help(p,'Sans charge, place le palpeur au centre et fais le zéro. Pose ensuite la charge. Relève le déplacement et les conditions. Reprends le zéro pour un nouvel essai. Un palpeur sur l’appui ne mesure pas la flèche au centre.');note(p,'Comparateur idéal, résolution simulée de 0,0001 mm pour explorer le modèle. Une règle de classe ne distingue pas les mêmes petites valeurs. Le calcul suit le modèle de la séquence, sans prédiction de rupture.');
},
workshop(p,c){
 const b=setup(p,'Fiche verticale, base et renfort en carton, vus de côté');b.drawing.setAttribute('viewBox','0 0 820 430');
 const steps=E('ol');['Mesure avant réparation : pose la fiche puis relève le déplacement.','Retire la fiche. Découpe le renfort et choisis un pliage et une fixation.','Place le renfort derrière la fiche, puis repose exactement la même fiche.','Relève la mesure après réparation. Décris la modification et compare sur papier.'].forEach(t=>steps.append(E('li',t)));p.insertBefore(steps,b.controls.parentElement);
 const material=select(b.controls,'Matériau du renfort',[['paper','Papier souple'],['card','Carton pliable'],['rigid','Plaque rigide']]),fold=select(b.controls,'Forme du renfort',[['0','Pièce plate'],['45','Renfort plié à 45°'],['90','Renfort plié à 90°']],'0'),join=select(b.controls,'Fixation',[['none','Sans fixation'],['tape','Ruban adhésif'],['slot','Languettes emboîtées']]),placed=toggle(b.controls,'Renfort placé derrière la fiche'),load=toggle(b.controls,'Même fiche posée sur le support');let cut=false;
 const draw=()=>{for(const i of [material,fold,join,placed])i.disabled=load.checked;const assembled=cut&&+fold.value>0&&join.value!=='none'&&placed.checked,deflection=load.checked?(assembled?(material.value==='paper'?10:material.value==='card'?3:2):18):0,tilt=deflection*.7;
 b.drawing.innerHTML=`<defs><linearGradient id="cardboard" x2="1" y2="1"><stop stop-color="#d7bd8d"/><stop offset="1" stop-color="#a68758"/></linearGradient></defs><rect x="15" y="15" width="790" height="400" rx="12" fill="#f5f4ed"/><path d="M55 353H755" stroke="#a79473" stroke-width="12"/><path d="M370 351L398 180L430 351Z" fill="url(#cardboard)" stroke="#7f6543" stroke-width="3"/><path d="M388 235l15 9-18 10 14 9" fill="none" stroke="#ae4a36" stroke-width="5"/><g transform="rotate(${tilt} 396 350)">${load.checked?'<rect x="323" y="54" width="150" height="275" rx="5" fill="#fffdf5" stroke="#728a80" stroke-width="3"/><path d="M345 100h105m-105 24h105m-105 24h75" stroke="#97ada1" stroke-width="3"/>':''}</g>${cut?(placed.checked?`<path d="M423 350L423 215L${+fold.value?535:439} 350Z" fill="url(#cardboard)" stroke="#7f6543" stroke-width="3"/>${join.value!=='none'?'<path d="M410 219h28M512 349h28" stroke="#e7ce78" stroke-width="15"/>':''}`:`<path d="M70 300H${+fold.value?140:240}L${+fold.value?195:240} ${+fold.value?230:280}H70Z" fill="url(#cardboard)" stroke="#7f6543" stroke-width="3"/>`):'<rect x="70" y="235" width="160" height="65" fill="url(#cardboard)" stroke="#7f6543" stroke-width="3"/><path d="M120 235V300M175 235V300" stroke="#6c7b70" stroke-dasharray="6 5"/>'}<g font-family="Arial" font-size="20" fill="#28453e"><text x="65" y="205">${cut?'Renfort découpé':'Pièce à préparer'}</text><text x="530" y="70">Fiche identique</text><path d="M525 80L473 130" stroke="#748b80"/><text x="545" y="190">Base endommagée</text><path d="M535 198L405 245" stroke="#748b80"/><text x="60" y="394">Vue de côté · déplacement amplifié</text></g>`;
 b.screen.textContent=load.checked?fmt(deflection)+' mm':'Sans charge';b.status.textContent=load.checked?'Mesure simulée avec la même fiche. Note avant ou après et tes réglages.':!cut?'Étape : découper le renfort.':!placed.checked?'Étape : choisir la forme et la fixation, puis placer le renfort.':'Renfort placé. Pose la fiche pour observer le résultat.';};
 button(b.controls,'Découper le renfort',()=>{if(load.checked){b.status.textContent='Retire la fiche avant de découper.';return}cut=true;draw()});button(b.controls,'Repartir avant réparation',()=>{load.checked=false;cut=false;placed.checked=false;fold.value='0';join.value='none';draw()});on([material,fold,join,placed,load],draw);help(p,'La vue montre le côté du support : la grande fiche est posée sur la base. Le renfort doit être découpé, plié, fixé et placé avant de tester. Change une seule condition à la fois.');note(p,'Atelier fictif : déplacements supplémentaires distincts des tableaux du dossier. Il représente l’effet des choix, pas les gestes réels ni la résistance d’un vrai carton.');
}
});
const list=window.instruments||[];
const toolAnchor=document.getElementById("experience-"+C.toolsBeforeExperience);
if(list.length){const intro=E('section',undefined,'bench-intro');intro.append(E('span','LES OUTILS DE CETTE SÉQUENCE','step'),E('h2','Manipule ici. Garde tes résultats sur papier.'),E('p','Choisis tes réglages, fais les essais, relève les mesures avec leurs unités. Note « simulé » sur ta feuille. Si le matériel est disponible, ajoute un essai réel et compare les deux.'));app.insertBefore(intro,toolAnchor)}
for(const [i,c] of list.entries()){const p=E('section',undefined,'panel instrument-panel');p.dataset.instrument=c.type;p.id='outil-'+(i+1);p.append(E('span','OUTIL SIMULÉ '+String(i+1).padStart(2,'0'),'step'),E('h2',c.title));if(c.task)p.append(E('p',c.task,'prompt'));T[c.type](p,c);app.insertBefore(p,toolAnchor)}
})();
