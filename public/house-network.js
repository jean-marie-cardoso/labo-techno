'use strict';
(() => {
 const legacy=window.projectWidgets.houseNetwork;
 window.projectWidgets.houseNetwork=function(p,c){
 if(c.school)return legacy(p,c);
 p.classList.add('house-workshop');
 const second=window.course.number===2;
 const devices=[
 {id:'tv',name:'Télévision',room:'Salon',type:'tv',x:90,y:390,ip:11,wire:true,port:4,role:'Reçoit des programmes par Internet ; reliée au switch par un câble RJ45.'},
 {id:'tablet',name:'Tablette',room:'Cuisine',type:'tablet',x:505,y:480,ip:13,role:'Consulte des sites et peut envoyer un document à l’imprimante par le Wi-Fi.'},
 {id:'a',name:'PC A',room:'Bureau',type:'pc',x:655,y:400,ip:10,wire:true,port:2,role:'Ordinateur fixe relié au switch. Il peut imprimer dans le réseau local.'},
 {id:'printer',name:'Imprimante',room:'Bureau',type:'printer',x:745,y:555,ip:20,wire:true,port:3,role:'Reçoit les documents du réseau local. Internet n’est pas nécessaire pour cet essai d’impression.'},
 {id:'b',name:'PC B',room:'Chambre 1',type:'laptop',x:220,y:155,ip:12,role:'Ordinateur portable connecté au point d’accès Wi-Fi de la box.'},
 {id:'console',name:'Console',room:'Chambre 2',type:'console',x:500,y:160,ip:14,wire:true,port:5,role:'Rejoint le réseau par un câble RJ45 jusqu’au switch du bureau.'},
 {id:'speaker',name:'Enceinte Wi-Fi',room:'Salle de bains',type:'speaker',x:705,y:160,ip:15,role:'Exemple d’enceinte sur batterie compatible avec une pièce humide, placée loin de l’eau. Elle rejoint le Wi-Fi de la box.'}
 ];
 let view='iso',showLinks=true,selected='a',route=[],state='Choisis un appareil pour connaître son rôle.',result='';
 const title=(s)=>p.append(E('h3',s));
 title(second?'Q1 · Repère les appareils et les deux liaisons':'Q1 · Explore la maison complète');
 p.append(E('p','Six pièces, un couloir, des portes, des fenêtres et du mobilier. Vue en coupe : le toit est retiré et les murs abaissés pour voir dedans. Le contour mesure 8 × 6 m. Clique sur un appareil, ou choisis-le dans la liste.'));
 const bar=E('div',undefined,'house-toolbar');p.append(bar);
 const iso=button(bar,'Vue en relief',()=>{view='iso';draw()}),top=button(bar,'Plan de dessus',()=>{view='top';draw()});
 const links=toggle(bar,'Afficher les liaisons',true);links.addEventListener('change',()=>{showLinks=links.checked;draw()});
 const graph=svg(p,'Maison meublée : salon, cuisine, bureau, deux chambres, salle de bains et couloir.');graph.classList.add('house-map');graph.setAttribute('viewBox','0 0 1240 800');
 const legend=E('p','Trait bleu : câble Ethernet avec prises RJ45. Pointillés orange : Wi-Fi. Trait violet : liaison de la box vers Internet.','house-legend');p.append(legend);
 const chooser=select(p,'Appareil à observer',devices.map(d=>[d.id,d.room+' · '+d.name]).concat([['box','Salon · Box'],['switch','Bureau · Switch 8 ports']]),'a');
 const detail=output(p);detail.classList.add('house-detail');
 const table=E('table');table.innerHTML='<thead><tr><th>Pièce</th><th>Appareil</th><th>Liaison</th></tr></thead><tbody>'+devices.map(d=>`<tr><td>${d.room}</td><td>${d.name}</td><td>${d.wire?'RJ45 → switch, port '+d.port:'Wi-Fi → box'}</td></tr>`).join('')+'</tbody>';p.append(table);
 title(second?'Q1 · Box et switch : deux rôles différents':'Q2 · Équipe ta maison dans Sweet Home 3D');
 p.append(E('p',second?'Le switch relie les appareils câblés entre eux. Le point d’accès de la box relie les appareils Wi-Fi au réseau. La box relie aussi la maison à Internet.':'Crée ta propre maison dans Sweet Home 3D : les six pièces et le couloir, les portes, les fenêtres et les meubles. Place chaque appareil du tableau. La box est dans le salon et le switch dans le bureau. Le guide PDF donne le plan et les étapes.'));
 const guide=E('a','Ouvrir le guide de la maison (PDF)');guide.href='../../documents/06_Aide_Sweet_Home_3D_5B01.pdf';guide.className='house-guide';p.append(guide);
 const ports=E('div',undefined,'house-ports');p.append(ports);
 ports.innerHTML='<strong>Switch du bureau · 8 ports RJ45</strong><div>'+['Box','PC A','Imprimante','Télévision','Console','Libre','Libre','Libre'].map((s,i)=>`<span><b>${i+1}</b>${s}</span>`).join('')+'</div>';
 p.append(E('p','Un câble par port. Le port 1 relie le switch à un port LAN de la box. Il reste trois ports libres. Le switch ne fournit pas de Wi-Fi. Les câbles traversent des gaines et des prises murales ; les traits montrent les connexions, pas un plan de câblage à réaliser.'));
 title(second?'Q2 · Essaie les adresses du réseau':'Q3 · Envoie un document à l’imprimante');
 p.append(E('p','Choisis un ordinateur ou la tablette, puis une demande. Tout fonctionne au départ. Fais un essai, change une seule chose, puis recommence. Reporte sur ta fiche : changement, résultat et trajet.'));
 const lab=E('div',undefined,'house-lab');p.append(lab);
 const source=select(lab,'Appareil qui envoie',[['a','PC A · câble RJ45'],['b','PC B · Wi-Fi'],['tablet','Tablette · Wi-Fi']]);
 const request=select(lab,'Demande',[['print','Imprimer un document'],['web','Ouvrir un site Internet']]);
 const out=output(p);out.classList.add('house-result');
 const send=button(p,'Envoyer la demande',test);
 const settings=E('details');settings.open=true;settings.append(E('summary','Changer une seule condition et refaire le test'));p.append(settings);
 const controls=E('div',undefined,'house-controls');settings.append(controls);
 const sw=toggle(controls,'Switch allumé',true),box=toggle(controls,'Box allumée',true),wifi=toggle(controls,'Wi-Fi activé sur la box',true),uplink=toggle(controls,'Câble switch–box branché',true),internet=toggle(controls,'Liaison Internet disponible',true);
 const endpoints={};for(const d of devices){const line=E('div',undefined,'house-device-control');line.append(E('strong',d.name+' · '+d.room));controls.append(line);endpoints[d.id]={power:toggle(line,d.name+' allumé'+(d.id==='printer'?'e':''),true),link:toggle(line,d.wire?'Câble '+d.name+'–switch branché':d.name+' connecté'+(d.id==='tablet'?'e':'')+' au Wi-Fi',true)};}
 const addr=E('div',undefined,'house-addresses');settings.append(addr);
 const ipB=select(addr,'Adresse locale du PC B',[[12,'192.168.1.12'],[20,'192.168.1.20 (essai de doublon)'],[30,'192.168.1.30']],12);
 addr.append(E('p','Imprimante : 192.168.1.20. PC A : 192.168.1.10. Box : 192.168.1.1. Les autres appareils ont chacun une adresse différente. Le switch simple n’a pas besoin d’une adresse à renseigner pour transmettre les trames.','hint'));
 button(p,'Rétablir tous les réglages',()=>{[sw,box,wifi,uplink,internet,...Object.values(endpoints).flatMap(v=>[v.power,v.link])].forEach(e=>e.checked=true);ipB.value='12';route=[];out.textContent='Tous les réglages sont rétablis. Envoie une nouvelle demande.';draw()});
 title(second?'Q3 · Sépare réseau local et Internet':'Q4 · Compare les chemins');
 const tasks=E('ol');[
 'PC A → imprimante : fais un essai avec tout branché, puis débranche seulement le câble de l’imprimante. Rebranche-le ensuite.',
 'Coupe seulement Internet : compare impression et site. Prévois le résultat avant de cliquer.',
 'Rétablis Internet, puis débranche seulement le câble switch–box. Compare l’impression depuis PC A et depuis PC B.',
 'Rebranche le câble switch–box. Éteins seulement le switch : compare l’accès au site depuis PC A et depuis PC B.',
 ...(second?['Rétablis tout. Donne au PC B la même adresse que l’imprimante. Essaie une impression, choisis ensuite une adresse libre et vérifie la réparation.']:[])
 ].forEach(t=>tasks.append(E('li',t)));p.append(tasks);
 if(second){title('Q4 · Protège les accès et les personnes');p.append(E('p','Sur ta fiche : que faire si un message réclame le mot de passe ? Que vérifier avant de publier une image ? Que faire si une photo humiliante circule ?'));}
 const limits=E('p','Réseau scolaire simplifié : portée Wi-Fi supposée suffisante, adresses locales déjà réglées, aucun accès réel à Internet ni à une imprimante. Un essai réussi ici ne garantit pas la réception Wi-Fi de la vraie maison.','hint');p.append(limits);
 function info(){const d=devices.find(v=>v.id===selected);detail.textContent=d?`${d.name} · ${d.room} · 192.168.1.${d.id==='b'?ipB.value:d.ip}. ${d.role}`:selected==='box'?'Box · salon. Port LAN vers le switch, point d’accès Wi-Fi pour les appareils sans fil, routeur vers Internet.':'Switch · bureau. Huit prises RJ45 : il transmet les données entre les appareils câblés. Un câble le relie à la box pour joindre les appareils Wi-Fi et Internet.';}
 const all=[source,request,sw,box,wifi,uplink,internet,ipB,...Object.values(endpoints).flatMap(v=>[v.power,v.link])];all.forEach(e=>e.addEventListener('change',()=>{route=[];out.textContent='Réglage modifié. Envoie une nouvelle demande.';draw()}));chooser.addEventListener('change',()=>{selected=chooser.value;draw()});
 function test(){
 const src=source.value,target=request.value==='print'?'printer':'web',d=devices.find(v=>v.id===src);route=[src];
 const adjacency={};const edge=(a,b)=>{(adjacency[a]??=[]).push(b);(adjacency[b]??=[]).push(a)};
 for(const d of devices)if(endpoints[d.id].power.checked&&endpoints[d.id].link.checked&&(d.wire?sw.checked:(box.checked&&wifi.checked)))edge(d.id,d.wire?'switch':'box');
 if(sw.checked&&box.checked&&uplink.checked)edge('switch','box');if(box.checked&&internet.checked)edge('box','web');
 let queue=[[src]],found=null,seen=new Set([src]);while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===target){found=path}for(const v of adjacency[last]||[])if(!seen.has(v)){seen.add(v);queue.push([...path,v])}}
 // A duplicate only affects a reachable active device in the same connected network.
 const conflict=target==='printer'&&ipB.value==='20'&&seen.has('b')&&endpoints.b.power.checked&&endpoints.b.link.checked&&box.checked&&wifi.checked;
 const name=id=>({switch:'switch',box:'box',web:'serveur du site'}[id]||devices.find(d=>d.id===id).name);
 if(!endpoints[src].power.checked)result=d.name+' est éteint : aucune demande envoyée.';
 else if(found&&conflict){route=found;result='Conflit d’adresses : PC B et imprimante utilisent 192.168.1.20. L’impression échoue dans ce modèle. Donne une adresse libre au PC B, puis reteste.';}
 else if(found){route=found;result=(target==='printer'?'Impression réussie.':'Site accessible.')+' Trajet : '+found.map(name).join(' → ')+'. '+(target==='printer'?(src==='a'?'Le message reste dans le switch et les appareils câblés.':'Le Wi-Fi rejoint le réseau câblé par la box et le switch.'):'La réponse revient par le chemin inverse.');}
 else{const reason=!endpoints[src].link.checked?'la liaison de '+d.name+' est coupée':!d.wire&&(!box.checked||!wifi.checked)?'le Wi-Fi de la box est indisponible':d.wire&&!sw.checked?'le switch est éteint':target==='printer'&&!endpoints.printer.power.checked?'l’imprimante est éteinte':target==='printer'&&!endpoints.printer.link.checked?'le câble de l’imprimante est débranché':target==='printer'&&!sw.checked?'le switch est éteint':!box.checked?'la box est éteinte':!uplink.checked&&(d.wire||target==='printer')?'le câble switch–box est débranché':target==='web'&&!internet.checked?'la liaison Internet est coupée':'une liaison nécessaire est indisponible';result='Demande non reçue : '+reason+'.';}
 out.textContent=result;out.dataset.success=String(!!found&&!conflict&&endpoints[src].power.checked);draw();
 }
 const colors={wood:'#c79460',wall:'#e1e7e5',bed:'#89aeca'};
 function draw(){
 iso.setAttribute('aria-pressed',view==='iso');top.setAttribute('aria-pressed',view==='top');info();
 const P=(x,y,z=0)=>view==='top'?[170+x,70+y]:[375+x*.92-y*.46,85+x*.30+y*.58-z*.65];
 const pt=v=>P(...v).map(n=>n.toFixed(1)).join(',');
 const poly=(vs,fill,stroke='#a2afa9')=>`<polygon points="${vs.map(pt).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
 const block=(x,y,w,d,h,color,z=0)=>poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],color)+ (view==='top'?'':poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],color)+poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],'#adb9b8'));
 const line=(a,b,color,width=3,dash='')=>`<path d="M${pt(a)} L${pt(b)}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''} fill="none"/>`;
 const text=(x,y,z,t,size=16)=>{const [a,b]=P(x,y,z);return `<text x="${a}" y="${b}" text-anchor="middle" font-size="${size}" fill="#203e3c" stroke="#fff" stroke-width="4" paint-order="stroke">${t}</text>`};
 let s='<rect width="1240" height="800" rx="20" fill="#e8f1ed"/>';
 s+=block(-10,-10,820,620,14,'#ccd5cc',-14);
 const rooms=[[0,0,300,260,'Chambre 1','#f3ddce'],[300,0,300,260,'Chambre 2','#dce8f4'],[600,0,200,260,'Salle de bains','#d6eeee'],[0,340,400,260,'Salon','#e8e1cf'],[400,340,200,260,'Cuisine','#ece3d6'],[600,340,200,260,'Bureau','#e1e7d3']];
 for(const [x,y,w,h,n,col]of rooms)s+=poly([[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]],col);
 s+=poly([[0,260,0],[800,260,0],[800,340,0],[0,340,0]],'#f9f8ed');
 // Low cutaway walls, with door openings into the corridor.
 for(const [x,y,w,h]of [[0,0,800,8],[0,0,8,260],[0,340,8,260],[792,0,8,600],[0,592,800,8],[296,0,8,260],[596,0,8,260],[396,340,8,260],[596,340,8,260],[0,256,175,8],[255,256,215,8],[550,256,115,8],[745,256,55,8],[0,336,260,8],[340,336,95,8],[515,336,135,8],[730,336,70,8]])s+=block(x,y,w,h,48,colors.wall);
 // Doors open into rooms; windows are blue frames on outer walls.
 for(const [x,y]of [[0,260],[175,260],[470,260],[665,260],[260,340],[435,340],[650,340]]){s+=line([x,y,2],[x,y+(y===260?-75:75),2],'#966943',5);}
 for(const x of [90,400,665])s+=block(x,0,90,9,28,'#9ddbe6',24);
 for(const x of [150,460,650])s+=block(x,591,80,9,28,'#9ddbe6',24);
 // Beds with headboard, pillows and blankets.
 for(const [x,y,col]of [[30,40,'#d88778'],[330,40,'#659ac0']]){s+=block(x,y,105,175,28,'#bca488');s+=block(x,y,105,9,65,'#927959');s+=block(x+4,y+12,97,32,8,'#fff8e8',28);s+=block(x+4,y+55,97,114,8,col,28);}
 // Wardrobes and desks.
 s+=block(180,15,100,38,85,'#ceb594')+block(190,110,85,60,47,colors.wood)+block(470,110,100,60,47,colors.wood);
 // Bathroom tub, sink, WC. Speaker is on a dry shelf away from water.
 s+=block(620,25,145,60,40,'#fafdfd')+block(631,35,123,37,2,'#acd9e4',40)+block(630,190,48,45,48,'#fcfcf5')+block(745,205,30,35,35,'#fff')+block(695,105,65,45,60,colors.wood);
 // Living room sofa, low table, TV cabinet; kitchen counters and dining table.
 s+=block(35,490,160,65,35,'#a0b3a1')+block(35,545,160,15,68,'#7a9582')+block(35,490,15,65,50,'#7a9582')+block(180,490,15,65,50,'#7a9582')+block(90,410,70,50,25,colors.wood)+block(30,355,115,40,45,colors.wood);
 s+=block(420,355,160,40,55,'#b8c4c0')+block(430,360,40,28,2,'#7d9d9e',55)+block(540,360,30,30,3,'#36494e',55)+block(435,460,100,65,44,colors.wood)+block(555,510,35,55,95,'#d7e2e3');
 // Office desks, shelf and entrance from outside to corridor.
 s+=block(620,355,165,65,46,colors.wood)+block(690,520,90,55,40,colors.wood)+block(615,520,50,55,36,'#799ea1');
 for(const [x,y,w,h,n]of rooms)s+=text(x+w/2,y+h-18,0,n,17);
 s+=text(100,308,0,'Couloir',15)+text(400,640,0,'8 m',19)+text(-35,300,0,'6 m',19);
 const points=Object.fromEntries(devices.map(d=>[d.id,[d.x,d.y,75]]));points.box=[340,410,55];points.switch=[765,465,65];points.web=[850,20,70];
 if(showLinks){for(const d of devices){const ok=endpoints[d.id].power.checked&&endpoints[d.id].link.checked&&(d.wire?sw.checked:box.checked&&wifi.checked);s+=line(points[d.id],points[d.wire?'switch':'box'],ok?(d.wire?'#1d70a6':'#bc7020'):'#a5a8a5',d.wire?3:3,d.wire?'':'7 7')};s+=line(points.switch,points.box,uplink.checked&&box.checked&&sw.checked?'#1d70a6':'#aaa',5);s+=line(points.box,points.web,internet.checked&&box.checked?'#8757a9':'#aaa',3);}
 function icon(type){if(type==='pc'||type==='tv'||type==='laptop')return '<rect x="-26" y="-23" width="52" height="34" rx="3" fill="#2b4355"/><rect x="-22" y="-19" width="44" height="25" rx="1" fill="#7dcfdd"/>'+(type==='laptop'?'<path d="M-26 11h52l7 8h-66z" fill="#5f7786"/>':'<path d="M0 11v8m-18 0h36" stroke="#2b4355" stroke-width="4"/>');if(type==='printer')return '<rect x="-24" y="-14" width="48" height="31" rx="5" fill="#8297a1"/><path d="M-16 -8v-22h32v22M-15 10h30v19h-30z" fill="white" stroke="#415b69"/><path d="M-9 16h18m-18 5h18" stroke="#839795"/>';if(type==='tablet')return '<rect x="-15" y="-27" width="30" height="49" rx="4" fill="#385369"/><rect x="-11" y="-22" width="22" height="35" fill="#e7b561"/><circle cy="18" r="2" fill="#eee"/>';if(type==='console')return '<rect x="-22" y="-22" width="17" height="41" rx="3" fill="#334c60"/><path d="M-1 1q16 -10 25 0l4 16q-3 9-11-2h-7q-12 12-13 2z" fill="#f7faff" stroke="#344d62"/><path d="M3 6h9m-5-4v9" stroke="#344d62"/>';if(type==='speaker')return '<rect x="-13" y="-23" width="26" height="43" rx="8" fill="#596b70"/><circle cy="1" r="8" fill="#a8c5bc"/><circle cy="-15" r="2" fill="#94edac"/>';if(type==='box')return '<rect x="-26" y="-12" width="52" height="25" rx="5" fill="#fcffff" stroke="#4a6868"/><path d="M-19-12v-17m38 17v-17" stroke="#4a6868" stroke-width="4"/><circle cx="-15" cy="4" r="3" fill="#20a363"/><path d="M-7-21q7-7 14 0m-20-5q13-13 26 0" fill="none" stroke="#d18935" stroke-width="3"/>';return '<rect x="-35" y="-13" width="70" height="27" rx="3" fill="#324e58"/>'+Array.from({length:8},(_,i)=>`<rect x="${-30+i*8}" y="0" width="6" height="6" fill="#e5d27b"/>`).join('');}
 for(const id of [...devices.map(d=>d.id),'box','switch']){const [x,y]=P(...points[id]),d=devices.find(v=>v.id===id),name=d?.name||(id==='box'?'Box':'Switch'),on=d?endpoints[id].power.checked:id==='box'?box.checked:sw.checked;s+=`<g class="house-hotspot" role="button" tabindex="0" aria-label="Observer ${name}" data-device="${id}" transform="translate(${x} ${y}) scale(.82)"><circle r="38" fill="${selected===id?'#ffefb4':'#ffffffed'}" stroke="${selected===id?'#be761c':'#a6b9b2'}" stroke-width="2"/>${icon(d?.type||id)}<rect x="-53" y="32" width="106" height="24" rx="6" fill="#fff"/><text y="49" text-anchor="middle" font-size="14" font-weight="bold" fill="#23423c">${name}</text>${on?'':'<path d="M-25-25L25 25" stroke="#b64032" stroke-width="5"/>'}</g>`;}
 const [wx,wy]=P(...points.web);s+=`<g transform="translate(${wx} ${wy})"><rect x="-48" y="-22" width="96" height="47" rx="22" fill="#e7d8f3"/><text text-anchor="middle" y="6" fill="#674387" font-size="17">Internet</text></g>`;
 if(route.length>1){const d=route.map((id,i)=>(i?'L':'M')+pt(points[id])).join(' ');s+=`<path d="${d}" fill="none" stroke="#e5aa19" stroke-width="6" stroke-dasharray="9 7"/><circle r="9" fill="#e97918" stroke="white" stroke-width="3"><animateMotion dur="2.4s" repeatCount="3" path="${d}"/></circle>`;}
 graph.innerHTML=s;graph.querySelectorAll('[data-device]').forEach(el=>{const choose=()=>{selected=el.dataset.device;chooser.value=selected;draw();detail.scrollIntoView({block:'nearest',behavior:'smooth'})};el.addEventListener('click',choose);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}})});
 }
 out.textContent='Tout est prêt. Envoie ta première demande.';draw();
 };
})();
