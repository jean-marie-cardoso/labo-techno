'use strict';
// Additional benches: only instrument readings and observations, never a verdict.
(()=>{
const configs=window.instruments||[];
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const text=(x,y,s,size=18)=>'<text x="'+x+'" y="'+y+'" style="font-size:'+size+'px">'+esc(s)+'</text>';
function setup(p,label){const grid=E('div',undefined,'bench'),controls=E('div',undefined,'bench-controls'),view=E('div',undefined,'bench-view');grid.append(controls,view);p.append(grid);const drawing=svg(view,label);drawing.setAttribute('viewBox','0 0 640 340');const screen=E('output','—','instrument-display');screen.setAttribute('aria-label','Lecture de l’instrument');screen.setAttribute('aria-live','polite');view.append(screen);const status=E('p','','bench-status');status.setAttribute('aria-live','polite');view.append(status);return {controls,view,drawing,screen,status}}
function note(p,s){p.append(E('p',s,'hint'))}
function choices(p,label,rows){return select(p,label,rows.map((r,i)=>[String(i),r[0]]))}
function help(p,s){const d=E('details',undefined,'instrument-help');d.append(E('summary','Prendre l’outil en main'),E('p',s));p.append(d)}
function blankOnChange(inputs,screen,status){for(const i of inputs)i.addEventListener('input',()=>{screen.textContent='—';status.textContent='Réglage modifié : effectue une nouvelle lecture.'})}
function ticks(x,y,count,step,scale,vertical=false){let s='';for(let i=0;i<=count;i++){const major=i%Math.max(5,Math.ceil(count/50)*5)===0,len=major?18:9;const at=i*step*scale;if(vertical)s+='<path d="M'+x+' '+(y+at)+'h'+len+'"/>'+ (major?text(x+22,y+at+5,fmt(i*step),14):'');else s+='<path d="M'+(x+at)+' '+y+'v'+len+'"/>'+(major?text(x+at-5,y+35,fmt(i*step),14):'')}return '<g stroke="#29494a" stroke-width="1">'+s+'</g>'}
const toolsUI={
lampMeasure(p,c){
 p.classList.add('lamp-measure');
 p.append(E('p','V1 · Choisis la base ou la zone libre de la table. Place le zéro au premier bord, puis amène le repère rouge au second bord. Note la lecture en centimètres sur ta feuille.'));
 const b=setup(p,'Lampe de lecture, base ou zone libre et règle graduée'),obj=choices(b.controls,'Dimension à mesurer',c.items);let ready=false;
 const place=button(b.controls,'Placer le zéro au bord gauche',()=>{ready=true;draw()});
 const cursor=range(b.controls,'Déplacer le repère de lecture (cm)',0,20,0,.1);b.drawing.setAttribute('viewBox','0 0 1000 690');
 const draw=()=>{
  const i=+obj.value,isBase=i<2,isWidth=i%2===1,k=25,size=c.items[i][1],cross=isBase?(isWidth?12:8):(isWidth?15:10),x=115,width=size*k,height=cross*k,y=95+(375-height)/2,ry=515;
  let scene=`<rect x="52" y="70" width="560" height="421" rx="12" fill="#d9c8a5" stroke="#8a7b61" stroke-width="3"/><path d="M70 87H590M70 476H590" stroke="#c8b28b" stroke-width="3"/>`;
  scene+=isBase?readingLampBase(x,y,width,height):`<rect class="measured-zone" x="${x}" y="${y}" width="${width}" height="${height}" fill="#f8f2e3" stroke="#91692d" stroke-width="3" stroke-dasharray="8 5"/><text x="${x+12}" y="${y+height/2}" style="font-size:19px">Zone libre</text>`;
  scene+=`<path d="M${x} ${y+height}V${ry+4}M${x+width} ${y+height}V${ry+4}" stroke="#568078" stroke-dasharray="5 5" stroke-width="2"/>`;
  const rx=ready?x:x+55;scene+=`<rect x="${rx-5}" y="${ry}" width="510" height="68" rx="4" fill="#e1e8e5" stroke="#61746e" stroke-width="2"/>`;
  for(let mm=0;mm<=200;mm++){const xx=rx+mm*k/10,major=mm%10===0;scene+=`<path d="M${xx} ${ry+3}v${major?22:mm%5===0?16:9}" stroke="#284139" stroke-width="${major?1.5:1}"/>`;if(major)scene+=text(xx-4,ry+44,String(mm/10),15)}
  scene+=text(rx+464,ry+62,'cm',14);
  if(ready){const xx=rx+ +cursor.value*k;scene+=`<path d="M${xx} ${ry-13}V${ry+71}" stroke="#af4939" stroke-width="3"/><path d="M${xx-7} ${ry-14}h14l-7 10Z" fill="#af4939"/>`;}
  b.drawing.innerHTML=text(30,35,c.items[i][0]+' · vue de dessus',23)+scene+readingLampSide(680,110,.88)+text(690,440,'Lampe L · repérage',18)+text(690,466,'Vue de côté',17)+text(30,629,isBase?'Mesure le contour de la base, sans inclure le bras.':'Mesure la zone délimitée sur la table, pas toute la table.',19)+text(30,661,'Objet et règle réduits à l’écran · graduations en cm',17);
  cursor.disabled=!ready;place.disabled=ready;b.screen.textContent=ready?'Repère : '+fmt(+cursor.value)+' cm':'Règle à placer';b.status.textContent=ready?'Aligne le trait rouge avec le pointillé du bord droit. Relève la mesure avec son unité.':'Clique sur « Placer le zéro au bord gauche » pour commencer.';
 };obj.addEventListener('input',()=>{ready=false;cursor.value=0;cursor.dispatchEvent(new Event('input'))});cursor.addEventListener('input',draw);draw();
 help(p,'Le zéro doit être aligné avec le premier bord. Lis la graduation sous le second bord. Chaque petite graduation vaut 1 mm, soit 0,1 cm. Les flèches du clavier déplacent le repère de 1 mm.');
 note(p,' La vue de dessus évite la déformation par la perspective. Ne mesure pas ton écran avec une vraie règle.');
},

phoneMeasure(p,c){
 p.classList.add('phone-measure');
 p.append(E('p','Choisis l’objet et la dimension. Place le zéro au bord de l’objet, puis déplace le repère rouge jusqu’à l’autre bord. Relève la lecture en centimètres sur ta feuille.'));
 const b=setup(p,'Téléphone ou support de recharge avec une règle graduée'),obj=choices(b.controls,'Dimension à mesurer',c.items);
 let ready=false;
 const place=button(b.controls,'Placer le zéro au bord gauche',()=>{ready=true;draw()});
 const cursor=range(b.controls,'Déplacer le repère de lecture (cm)',0,20,0,.1);
 b.drawing.setAttribute('viewBox','0 0 880 640');
 const draw=()=>{
  const i=+obj.value,isPhone=i<2,isWidth=i%2===1,k=26,measure=c.items[i][1],cross=isPhone?(isWidth?15:7):(isWidth?12:6);
  const x=140,width=measure*k,height=cross*k,y=85+(390-height)/2,ry=515;
  let scene=(isPhone?phoneObject:chargingSupport)(x,y,width,height);
  scene+='<path d="M'+x+' '+(y+height)+'V'+(ry+12)+'M'+(x+width)+' '+(y+height)+'V'+(ry+12)+'" stroke="#71938d" stroke-dasharray="5 5" stroke-width="2"/>';
  const rulerX=ready?x:x+70;
  scene+=`<rect x="${rulerX-5}" y="${ry}" width="530" height="67" rx="5" fill="#e1e8e5" stroke="#60746e" stroke-width="2"/>`;
  for(let mm=0;mm<=200;mm++){
   const xx=rulerX+mm*k/10,major=mm%10===0;
   scene+=`<path d="M${xx} ${ry+3}v${major?22:mm%5===0?16:9}" stroke="#233e39" stroke-width="${major?1.5:1}"/>`;
   if(major)scene+=text(xx-4,ry+44,String(mm/10),15);
  }
  scene+=text(rulerX+475,ry+61,'cm',14);
  if(ready){const cx=rulerX+ +cursor.value*k;scene+=`<path d="M${cx} ${ry-14}V${ry+71}" stroke="#af4939" stroke-width="3"/><path d="M${cx-7} ${ry-14}h14l-7 10Z" fill="#af4939"/>`;}
  b.drawing.innerHTML=text(35,35,c.items[i][0]+' · vue de dessus',23)+scene+text(35,617,'Objet et règle réduits à l’écran · graduations en cm',18);
  cursor.disabled=!ready;place.disabled=ready;
  b.screen.textContent=ready?'Repère : '+fmt(+cursor.value)+' cm':'Règle à placer';
  b.status.textContent=ready?'Place le trait rouge sous le bord droit de l’objet. Les pointillés prolongent ses deux bords jusqu’à la règle.':'Clique sur « Placer le zéro au bord gauche ». Pour le support, mesure la surface de pose, sans le câble.';
 };
 obj.addEventListener('input',()=>{ready=false;cursor.value=0;cursor.dispatchEvent(new Event('input'))});cursor.addEventListener('input',draw);draw();
 help(p,'Le zéro doit être aligné avec le premier bord. Lis la graduation sous le second bord. Entre deux centimètres, chaque petite graduation vaut 1 mm, soit 0,1 cm. Les flèches du clavier déplacent le repère de 1 mm.');
 note(p,' Une vue de dessus permet de mesurer sans perspective. Ne mesure pas ton écran avec une vraie règle.');
},

elevatorTape(p,c){
 p.classList.add('elevator-tape');
 p.append(E('p','1. Choisis une dimension. 2. Accroche le zéro au point de départ. 3. Déroule le ruban jusqu’au point d’arrivée. Lis la graduation et note la mesure sur papier.','tape-instructions'));
 const b=setup(p,'Cabine d’élévateur et mètre ruban'),obj=choices(b.controls,'Dimension à mesurer',c.items);
 const hook=button(b.controls,'Accrocher le zéro au départ',()=>{anchored=true;draw()});
 const length=range(b.controls,'Dérouler le ruban (cm)',0,200,0,1);
 button(b.controls,'Rentrer le ruban',()=>{length.value=0;length.dispatchEvent(new Event('input'))});
 let anchored=false;
 b.drawing.setAttribute('viewBox','0 0 880 570');
 // Orthographic views keep the measuring tape and the measured surface in the same plane.
 const label=(x,y,s,size=19)=>text(x,y,s,size);
 const draw=()=>{
  const i=+obj.value,dimension=c.items[i][1],vertical=i>=3,k=1.95,amount=+length.value;
  length.max=vertical?'180':'200';
  let start,finish,scene='',title='',axisLabel='';
  const defs='<defs><linearGradient id="lift-metal"><stop stop-color="#9eafb2"/><stop offset=".35" stop-color="#edf2f1"/><stop offset="1" stop-color="#92a3a7"/></linearGradient><linearGradient id="lift-wall" x2="1" y2="1"><stop stop-color="#eff4f1"/><stop offset="1" stop-color="#bccdc9"/></linearGradient></defs>';
  if(i<3){
   const x=230,w=dimension*k,y=420,model='ABC'[i],by=438-(i===2?110:78)*k;start=[x,y];finish=[x+w,y];title='Cabine '+model+' · vue de face';axisLabel='Largeur intérieure, entre les deux parois';
   scene=`<rect x="${x-33}" y="66" width="${w+66}" height="398" rx="8" fill="url(#lift-metal)" stroke="#596e70" stroke-width="4"/>
   <rect x="${x}" y="99" width="${w}" height="339" fill="url(#lift-wall)" stroke="#677f7d" stroke-width="2"/>
   <path d="M${x+15} 99V405H${x+w-15}V99M${x} 438L${x+15} 405M${x+w} 438L${x+w-15} 405" fill="none" stroke="#8da39e" stroke-width="2"/>
   <path d="M${x+23} 260H${x+w-23}" stroke="#607c7a" stroke-width="10"/><path d="M${x+23} 257H${x+w-23}" stroke="#eaf1ec" stroke-width="4"/>
   <rect x="${x+w-48}" y="${by-20}" width="28" height="64" rx="5" fill="#556e73"/><circle cx="${x+w-34}" cy="${by}" r="8" fill="#bcd2a2" stroke="#edf4e5" stroke-width="2"/>
   <path d="M${x-33} 454H${x+w+33}" stroke="#536465" stroke-width="8"/>
   <rect x="${x+w/2-30}" y="76" width="60" height="17" rx="4" fill="#263e42"/><text x="${x+w/2-6}" y="90" style="font-size:14px;fill:white">${model}</text>
   ${label(x-20,490,'Seuil de la cabine',18)}`;
  }else if(i===3){
   start=[440,450];finish=[440,450-dimension*k];title='Cabines A, B et C · vue de dessus';axisLabel='Longueur intérieure, de l’entrée au fond';
   const left=337.625,right=542.375,w=right-left;
   scene=`<rect x="${left-18}" y="101" width="${w+36}" height="370" rx="10" fill="url(#lift-metal)" stroke="#607776" stroke-width="4"/>
   <rect x="${left}" y="118.5" width="${w}" height="331.5" fill="#dce5df" stroke="#92a6a0" stroke-width="2"/>
   <path d="M${left} 200H${right}M${left} 280H${right}M${left} 360H${right}M390 119V450M490 119V450" stroke="#bdcec3"/>
   <path d="M${left+15} 150H${right-15}" stroke="#58736e" stroke-width="10"/>
   <rect x="${right-25}" y="272" width="20" height="50" rx="3" fill="#546c70"/><circle cx="${right-15}" cy="286" r="5" fill="#c7dfab"/>
   <path d="M${left+25} 450H${right-25}" stroke="#fafcf8" stroke-width="24"/>
   <path d="M${left+25} 461H${right-25}" stroke="#627978" stroke-width="3"/>${label(405,505,'Entrée',20)}${label(right+25,135,'Fond',18)}`;
  }else{
   start=[415,450];finish=[415,450-dimension*k];title=i===4?'Cabine A ou B · paroi de commande':'Cabine C · paroi de commande';axisLabel='Hauteur du centre du bouton, depuis le sol';
   const by=finish[1];
   scene=`<rect x="236" y="62" width="355" height="388" fill="url(#lift-wall)" stroke="#819792" stroke-width="3"/>
   <rect x="236" y="62" width="23" height="388" fill="url(#lift-metal)"/><path d="M236 450H650L710 492H180Z" fill="#b5c1b9" stroke="#6d8279" stroke-width="3"/>
   <path d="M278 450L257 490M354 450L350 490M500 450L527 490M577 450L618 490" stroke="#91a698"/>
   <rect x="465" y="${by-50}" width="73" height="135" rx="12" fill="url(#lift-metal)" stroke="#4e6469" stroke-width="3"/>
   <circle cx="500" cy="${by}" r="21" fill="#eef5e7" stroke="#47665c" stroke-width="5"/>
   <path d="M493 ${by+4}L500 ${by-6}L507 ${by+4}" fill="none" stroke="#47665c" stroke-width="3"/>
   <circle cx="500" cy="${by+53}" r="10" fill="#cbad7c" stroke="#657266"/>
   <path d="M415 ${by}H475" stroke="#396e77" stroke-width="2" stroke-dasharray="5 5"/>${label(550,by+7,'Bouton',18)}${label(602,470,'Sol',18)}`;
  }
  const [sx,sy]=start,[tx,ty]=finish,end=vertical?[sx,sy-amount*k]:[sx+amount*k,sy];
  let tape='';
  if(anchored){
   // Tape runs upward for height/depth; its hook stays at zero. Housing moves with the free end.
   const rotation=vertical?-90:0;let marks='';
   for(let cm=0;cm<=amount;cm++){const xx=cm*k,major=cm%10===0;marks+=`<path d="M${xx} -15v${major?15:cm%5===0?10:5}" stroke="#2d3835" stroke-width="${major?1.5:1}"/>`;if(major)marks+=label(xx+2,12,String(cm),12)}
   tape=`<g transform="translate(${sx} ${sy}) rotate(${rotation})"><rect x="0" y="-17" width="${amount*k}" height="34" fill="#f2cf54" stroke="#9e812a"/>${marks}<path d="M0 -21V22H9" fill="none" stroke="#51656c" stroke-width="5"/>
   <rect x="${amount*k}" y="-27" width="65" height="56" rx="13" fill="#d9a82e" stroke="#4c5550" stroke-width="4"/><rect x="${amount*k+15}" y="-13" width="37" height="29" rx="6" fill="#324d4c"/>
   <path d="M${amount*k} -23V24" stroke="#bc4538" stroke-width="3"/></g>`;
  }else{
   tape='<rect x="690" y="348" width="93" height="78" rx="20" fill="#d9a82e" stroke="#465550" stroke-width="5"/><rect x="716" y="366" width="44" height="37" rx="8" fill="#344d4a"/>'+label(679,454,'Mètre ruban',17);
  }
  const pin=(x,y,color)=>`<circle cx="${x}" cy="${y}" r="7" fill="white" stroke="${color}" stroke-width="3"/>`;
  b.drawing.innerHTML=defs+label(35,32,title,23)+scene+tape+pin(sx,sy,'#27675e')+pin(tx,ty,'#a34436')+
   label(vertical?sx-85:sx-78,sy+(vertical?28:-40),'Départ',17)+label(vertical?tx-90:tx+10,ty-28,'Arrivée',17)+label(35,548,axisLabel,20);
  b.drawing.setAttribute('aria-label',title+'. '+axisLabel+'. '+(anchored?'Ruban déroulé de '+amount+' cm.':'Ruban à accrocher au départ.'));
  hook.disabled=anchored;length.disabled=!anchored;
  b.screen.textContent=anchored?'Ruban déroulé : '+amount+' cm':'Ruban non accroché';
  b.status.textContent=anchored?'Amène le trait rouge du boîtier sur le point « Arrivée ». La graduation à ce trait se lit en centimètres.':'Le point « Départ » indique où accrocher le zéro. Le point « Arrivée » indique la fin de la dimension à mesurer.';
 };
 obj.addEventListener('input',()=>{anchored=false;length.value=0;length.dispatchEvent(new Event('input'))});length.addEventListener('input',draw);
 draw();help(p,'Le crochet métallique marque le zéro. Le ruban doit être tendu et aligné sur la dimension. Pour la hauteur du bouton, pars du sol et vise le centre du bouton, pas le bas de sa plaque. Tu peux déplacer le curseur au clavier avec les flèches (1 cm par appui).');
 note(p,' Vues simplifiées sans perspective sur la mesure ; le dessin est réduit à l’écran. Ne mesure pas ton écran avec un vrai mètre. Aucune conformité n’est décidée à ta place.');
},

length(p,c){
 const b=setup(p,'Objet, règle graduée et deux repères de lecture'),obj=choices(b.controls,'Dimension à mesurer',c.items),unit=c.unit||'mm';
 const zero=range(b.controls,'Décaler le zéro ('+unit+')',-c.max/5,c.max/5,0,c.step||1),angle=select(b.controls,'Position de la règle',[['parallel','Parallèle au côté'],['tilted','En biais']]);
 const cursor=range(b.controls,'Déplacer le repère de lecture ('+unit+')',0,c.max,c.max/2,c.step||1);let current=0;
 const draw=()=>{const len=c.items[+obj.value][1],k=400/c.max,x=105+ +zero.value*k,a=angle.value==='parallel'?0:12;current=+cursor.value;b.drawing.innerHTML='<rect x="105" y="65" width="'+len*k+'" height="55" rx="5" fill="#b38a58" stroke="#634b33" stroke-width="3"/>'+text(105,45,c.items[+obj.value][0])+'<path d="M105 65V195M'+(105+len*k)+' 65V195" stroke="#426d88" stroke-dasharray="4 4"/><g transform="rotate('+a+' '+x+' 160)"><rect x="'+(x-12)+'" y="153" width="430" height="65" rx="4" fill="#f1df9e" stroke="#a99258"/>'+ticks(x,155,Math.round(c.max/(c.step||1)),c.step||1,k)+'<path d="M'+(x+current*k)+' 133v100" stroke="#b54c42" stroke-width="3"/></g>'+text(85,285,'Graduations en '+unit+' · objet réduit à l’écran');b.screen.textContent='Repère : '+fmt(current)+' '+unit;b.status.textContent='Lis les deux extrémités. Calcule la différence sur papier.'};
 on([obj,zero,angle,cursor],draw);help(p,'Place la règle parallèlement au côté. Aligne le zéro avec une extrémité, puis déplace le repère vers l’autre. Tu peux aussi relever deux graduations et calculer leur différence sur papier. Ne mesure pas ton écran avec une vraie règle.');
},
caliper(p,c){
 const b=setup(p,'Pied à coulisse simplifié, mâchoires intérieures et encoche'),obj=choices(b.controls,'Pièce',c.items),gap=range(b.controls,'Ouvrir les mâchoires (mm)',0,20,2,.1);const power=toggle(b.controls,'Allumer',true);let offset=0;
 const draw=()=>{const size=c.items[+obj.value][1],g=Math.min(+gap.value,size);if(+gap.value>size){gap.value=size;gap.closest('label').querySelector('output').value=fmt(size);}const x=130,k=17;b.drawing.innerHTML='<path d="M90 220V70H'+x+'V145H'+(x+size*k)+'V70H570V220Z" fill="#b69567" stroke="#745632" stroke-width="3"/><path d="M'+x+' 140V260H'+(x+g*k)+'V140" fill="none" stroke="#75878a" stroke-width="12"/><rect x="'+(x-20)+'" y="255" width="390" height="30" fill="#c4cecd" stroke="#4c6767"/>'+text(85,35,c.items[+obj.value][0])+text(85,325,'Mesure intérieure · mâchoires vues de face');b.screen.textContent=power.checked?fmt(Math.round((g-offset)*10)/10)+' mm':'ÉTEINT';b.status.textContent='Les mâchoires s’arrêtent au contact des deux bords.'};
 button(b.controls,'Faire le zéro',()=>{offset=+gap.value;draw()});on([obj,gap,power],draw);help(p,'Ferme les mâchoires pour vérifier le zéro. Place les becs intérieurs dans l’encoche puis écarte-les jusqu’au contact, sans forcer. Ici, la pièce reste en place et tu commandes l’ouverture.');note(p,'Résolution simulée : 0,1 mm. La position du zéro influence la lecture ; le simulateur ne choisit pas la pièce conforme.');
},
lux(p,c){
 const b=setup(p,'Lampe, surface de travail et cellule du luxmètre'),form=choices(b.controls,'Source ou forme étudiée',c.samples||[['Forme X',[210,205,208]],['Forme Y',[240,235,238]]]),trial=select(b.controls,'Essai',[['0','1'],['1','2'],['2','3']]);
 const dist=range(b.controls,'Distance lampe–surface (cm)',25,100,50,5),lateral=range(b.controls,'Position du capteur sur la table (cm)',-40,40,0,5),angle=range(b.controls,'Inclinaison du capteur (°)',0,90,0,15),cap=toggle(b.controls,'Capuchon sur la cellule',true),power=toggle(b.controls,'Luxmètre allumé'),lamp=toggle(b.controls,'Lampe allumée',true),ambient=toggle(b.controls,'Éclairage ambiant ajouté');
 const draw=()=>{const x=340+ +lateral.value*3,dy=(50- +dist.value)*1.3;b.drawing.innerHTML='<path d="M60 268H595" stroke="#8d785a" stroke-width="12"/><path d="M135 264V'+(70+dy)+'H310" fill="none" stroke="#4e6665" stroke-width="12"/><path transform="translate(0 '+dy+')" d="M265 65H355L378 120H242Z" fill="#788d85" stroke="#354e48"/>'+(lamp.checked?'<path d="M250 '+(120+dy)+'L170 260H475L368 '+(120+dy)+'Z" fill="#f1d58044"/>':'')+'<g transform="rotate('+angle.value+' '+x+' 251)"><ellipse cx="'+x+'" cy="251" rx="34" ry="12" fill="'+(cap.checked?'#3b4848':'#fafaf0')+'" stroke="#3e6062" stroke-width="5"/></g><path d="M'+x+' 262Q'+x+' 310 475 310" stroke="#333" fill="none" stroke-width="3"/><rect x="475" y="280" width="118" height="46" rx="9" fill="#bcd0a9" stroke="#425d45"/>'+text(85,330,'Cellule du luxmètre')+text(478,310,'LUX',16)};
 on([form,trial,dist,lateral,angle,cap,power,lamp,ambient],draw);blankOnChange([form,trial,dist,lateral,angle,cap,power,lamp,ambient],b.screen,b.status);
 button(b.controls,'Lire le luxmètre',()=>{if(!power.checked){b.screen.textContent='ÉTEINT';return}const rows=c.samples||[['Forme X',[210,205,208]],['Forme Y',[240,235,238]]];const ref=rows[+form.value][1][+trial.value];const direct=lamp.checked?ref*(50/+dist.value)**2/(1+(+lateral.value/+dist.value)**2)**1.5:0;const val=cap.checked?0:(direct+(ambient.checked?60:0))*Math.max(0,Math.cos(+angle.value*Math.PI/180));b.screen.textContent=Math.round(val)+' lx';b.status.textContent='Lecture simulée. Note aussi forme, essai, distance, position et orientation sur papier.'});help(p,'Allume le luxmètre, retire le capuchon, pose la cellule sur la surface étudiée. Pour comparer deux formes, garde le même point, la même distance, la même orientation et le même éclairage ambiant.');note(p,'Modèle lumineux simplifié. Les séries du dossier sont reproduites au centre, à 50 cm, cellule horizontale, sans éclairage ambiant ajouté. Les autres positions servent à expérimenter ; elles ne prédisent pas une lampe réelle.');
},
multimeter(p,c){
 const b=setup(p,'Multimètre avec sélecteur, bornes et pointes de touche'),object=select(b.controls,'Objet sur le banc',[['battery','Batterie de maquette'],['wire','Câble à tester']]),source=select(b.controls,'État de la batterie',[['normal','Chargée'],['weak','Faible']]),fault=toggle(b.controls,'Coupure dans le câble'),supply=toggle(b.controls,'Circuit alimenté');
 const mode=select(b.controls,'Sélecteur',[['off','OFF'],['dc','V continu (V⎓)'],['ohm','Continuité / Ω']]),cal=select(b.controls,'Calibre tension',[['2','2 V'],['20','20 V']]),black=select(b.controls,'Cordon noir : borne',[['none','Débranché'],['COM','COM'],['V','VΩ']]),red=select(b.controls,'Cordon rouge : borne',[['none','Débranché'],['V','VΩ'],['A','A (courant)']]);
 const endpoints=[['none','Sans contact'],['minus','Point − / extrémité gauche'],['plus','Point + / extrémité droite']];const bp=select(b.controls,'Pointe noire',endpoints),rp=select(b.controls,'Pointe rouge',endpoints);
 const draw=()=>{const battery=object.value==='battery';
 for(const [input,visible] of [[source,battery],[fault,!battery],[supply,!battery],[cal,mode.value==='dc']]){input.closest('label').hidden=!visible;input.disabled=!visible;}
 for(const probe of [bp,rp]){probe.options[1].textContent=battery?'Point − de la batterie':'Extrémité gauche du câble';probe.options[2].textContent=battery?'Point + de la batterie':'Extrémité droite du câble';}
 const pos={none:[355,290],minus:[410,100],plus:[565,100]};const [bx,by]=pos[bp.value],[rx,ry]=pos[rp.value];b.drawing.innerHTML='<rect x="45" y="25" width="230" height="275" rx="22" fill="#e8bd4c" stroke="#5f573b" stroke-width="6"/><rect x="70" y="48" width="180" height="50" fill="#bac9ac"/>'+text(91,80,mode.value==='off'?'OFF':mode.value==='dc'?'V⎓':'Ω',25)+'<circle cx="160" cy="168" r="45" fill="#384a46"/><path d="M160 168L'+(mode.value==='off'?160:mode.value==='dc'?194:124)+' '+(mode.value==='off'?130:188)+'" stroke="white" stroke-width="7"/>'+text(79,278,'COM',16)+text(150,278,'VΩ',16)+text(218,278,'A',16)+'<circle cx="95" cy="249" r="10" fill="#222"/><circle cx="165" cy="249" r="10" fill="#ae433a"/><circle cx="226" cy="249" r="10" fill="#ae433a"/>'+(object.value==='battery'?'<rect x="396" y="63" width="183" height="115" rx="8" fill="#7b9692"/>':'<path d="M410 100H475 M'+(fault.checked?505:475)+' 100H565" stroke="#6880a1" stroke-width="12"/>')+text(400,52,battery?'−':'G')+text(554,52,battery?'+':'D')+'<circle cx="410" cy="100" r="8" fill="#263e42"/><circle cx="565" cy="100" r="8" fill="#bd5444"/>'+(black.value!=='none'?'<path d="M'+(black.value==='COM'?95:165)+' 250Q320 360 '+bx+' '+by+'" stroke="#252b2a" fill="none" stroke-width="4"/>':'')+(red.value!=='none'?'<path d="M'+(red.value==='V'?165:226)+' 250Q360 330 '+rx+' '+ry+'" stroke="#b34339" fill="none" stroke-width="4"/>':'')+text(372,220,battery?'Maquette ≤ 12 V':supply.checked?'Câble sous tension':'Câble hors tension',19)};
 const inputs=[object,source,fault,supply,mode,cal,black,red,bp,rp];on(inputs,draw);blankOnChange(inputs,b.screen,b.status);
 button(b.controls,'Effectuer la lecture',()=>{let value='—',msg='Lecture simulée. Relève le réglage, les points touchés et la valeur sur papier.';
 if(mode.value==='off')value='ÉTEINT';
 else if(red.value==='A'){value='BLOQUÉ';msg='La borne A n’est pas utilisée sur ce banc. Une mesure de tension sur cette borne peut provoquer un court-circuit.'}
 else if(black.value!=='COM'||red.value!=='V'){value='CORDONS';msg='Le circuit de mesure n’est pas établi avec ces branchements.'}
 else if(bp.value==='none'||rp.value==='none'){value='—';msg='Une pointe ne touche pas de point de mesure.'}
 else if(mode.value==='ohm'&&(object.value==='battery'||supply.checked)){value='BLOQUÉ';msg=object.value==='battery'?'Tu testes une batterie : choisis V continu pour mesurer sa tension. Le mode continuité ne convient pas à une batterie.':'Le câble est encore alimenté. Décoche « Circuit alimenté », puis refais la lecture de continuité.'}
 else if(mode.value==='ohm'){value=(bp.value===rp.value||!fault.checked)?'0,2 Ω':'OL';msg=value==='OL'?'Circuit ouvert entre les pointes.':'Faible résistance entre les pointes.'}
 else{const v=object.value==='battery'?(source.value==='normal'?(c.voltage||6):(c.voltage||6)*.7):0;const signed=bp.value===rp.value?0:rp.value==='plus'?v:-v;value=Math.abs(signed)>=+cal.value?'OL':signed.toFixed(2).replace('.',',')+' V';if(value==='OL')msg='Dépassement du calibre sélectionné.'}
 b.screen.textContent=value;b.status.textContent=msg});help(p,'Pour une tension continue : cordon noir sur COM, rouge sur VΩ, sélecteur V⎓, puis les pointes sur les deux points à comparer. Le signe dépend du sens des pointes. Pour la continuité : câble isolé, hors tension. Aucune mesure de courant ni prise secteur sur ce banc.');note(p,'Ce banc entraîne au choix des réglages ; il ne valide pas le geste réel. La notice et les consignes du professeur restent nécessaires pour un vrai appareil.');
},
balance(p,c){
 const b=setup(p,'Balance électronique, plateau et objet à peser'),object=choices(b.controls,'Objet à peser',c.items),trial=select(b.controls,'Essai',[['0','1'],['1','2'],['2','3']]),power=toggle(b.controls,'Allumer la balance'),bowl=toggle(b.controls,'Poser le récipient vide'),placed=toggle(b.controls,'Poser l’objet / la portion');let tare=0;
 const gross=()=> (bowl.checked?(c.bowl||80):0)+(placed.checked?c.items[+object.value][1][+trial.value]:0);
 const draw=()=>{b.drawing.innerHTML='<path d="M130 205H500L535 295H100Z" fill="#c3ccca" stroke="#4d6765" stroke-width="4"/><ellipse cx="315" cy="205" rx="180" ry="24" fill="#e8eeee" stroke="#4d6765" stroke-width="3"/>'+(bowl.checked?'<path d="M205 115Q220 210 315 205Q410 210 425 115Z" fill="#b3c9d280" stroke="#567980" stroke-width="3"/>':'')+(placed.checked?'<rect x="265" y="125" width="100" height="65" rx="15" fill="#bc925c" stroke="#7c5834"/>'+text(225,95,c.items[+object.value][0],17):'')+'<rect x="220" y="245" width="195" height="36" rx="4" fill="#b6c7a3"/>'+text(250,271,'BALANCE',18);b.screen.textContent=power.checked?fmt(gross()-tare)+' g':'ÉTEINTE';b.status.textContent='Lecture nette après la dernière tare. Relève la valeur avec son unité.'};
 button(b.controls,'Tare / zéro',()=>{if(power.checked){tare=gross();draw()}});on([object,trial,power,bowl,placed],draw);help(p,'Allume la balance. Vérifie le zéro à vide. Pour une portion : pose le récipient vide, fais la tare, puis ajoute la portion. Garde les mêmes conditions pour les trois essais.');note(p,' Le récipient pèse '+(c.bowl||80)+' g dans ce modèle ; la tare soustrait la charge présente au moment du clic. Aucun choix de modèle ni verdict automatique.');
},
};
window.instrumentTools=toolsUI;
window.instrumentHelpers={setup,note,help,choices,text,esc,ticks,blankOnChange};
})();
