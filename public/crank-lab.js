(()=>{'use strict';
const $=id=>document.getElementById(id),graph=document.querySelector('.crank-drawing svg');
let energy=0,turns=0,seconds=0,turning=false,running=false,turnTimeout=null,clock=null,finished=false;

const trials=[
 ['Essai 1 · Tester sans réserve', ['Clique sur « Repartir à zéro » : le compteur de tours et la réserve reviennent à 0.', 'Coche « Fermer l’interrupteur ». Ne tourne pas la manivelle.', 'Observe la DEL et remplis la ligne 1 de ta fiche.']],
 ['Essai 2 · Recharger sans éclairer', ['Décoche « Fermer l’interrupteur » pour ouvrir le circuit.', 'Clique une fois sur « Faire 1 tour de manivelle ». Attends la fin du mouvement, puis clique une deuxième fois.', 'Vérifie que le compteur indique 2 tours. Observe la DEL et remplis la ligne 2. Garde cette charge pour la suite.']],
 ['Essai 3 · Utiliser la réserve après l’arrêt', ['Ne clique pas sur « Repartir à zéro » et ne tourne plus la manivelle : garde les 2 tours de l’essai précédent.', 'Coche « Fermer l’interrupteur ». Laisse le chronomètre arrêté.', 'Observe la DEL avec la manivelle immobile. Remplis la ligne 3.']],
 ['Essai 4 · Couper le passage de l’énergie', ['Garde la charge de l’essai 3. Ne remets pas à zéro et ne tourne pas la manivelle.', 'Décoche « Fermer l’interrupteur » pour ouvrir le circuit.', 'Observe le changement de la DEL et remplis la ligne 4.']]
];
function showTrial(i){const box=$('trial-help');box.replaceChildren();const h=document.createElement('h4');h.textContent=trials[i][0];box.append(h);const list=document.createElement('ol');for(const text of trials[i][1]){const li=document.createElement('li');li.textContent=text;list.append(li)}box.append(list);document.querySelectorAll('[data-trial]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.trial===i)))}
document.querySelectorAll('[data-trial]').forEach(b=>b.addEventListener('click',()=>showTrial(+b.dataset.trial)));showTrial(0);

const descriptions=[
 'La main pousse la poignée : la manivelle et l’axe de la génératrice tournent ensemble.',
 'Quand son axe tourne, la génératrice fournit de l’énergie électrique. Sans rotation, elle n’en fournit plus.',
 'L’accumulateur reçoit de l’énergie pendant la recharge. Il en garde une réserve, utilisable après l’arrêt de la manivelle.',
 'Fermé, l’interrupteur permet le passage dans le circuit des DEL. Ouvert, il coupe ce passage.',
 'Les DEL reçoivent de l’énergie électrique et produisent de la lumière. Une partie de l’énergie est aussi dissipée en chaleur.'
];
const nodes=['.crank-handle','.crank-generator','.crank-stock','.crank-switch','.crank-leds'];
for(const b of document.querySelectorAll('[data-part]')){b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{document.querySelectorAll('[data-part]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));$('part-description').textContent=descriptions[+b.dataset.part];nodes.forEach((s,i)=>{graph.querySelector(s).style.filter=i===+b.dataset.part?'drop-shadow(0 0 7px #d97912)':''});$('inside').checked=true;draw()})}
function lit(){return energy>0&&$('switch').checked}
function pause(){running=false;clearInterval(clock);clock=null}
function draw(){
 graph.classList.toggle('show-inside',$('inside').checked);graph.classList.toggle('is-turning',turning);graph.classList.toggle('is-lit',lit());graph.classList.toggle('is-charged',energy>0);
 graph.querySelector('.crank-switch').setAttribute('x',$('switch').checked?'483':'452');graph.querySelector('.crank-stock').setAttribute('width',String(103*energy/12));
 graph.querySelector('.crank-motion').textContent=turning?'La manivelle et la génératrice tournent.':'La manivelle est arrêtée.';
 $('turns').textContent=turns;$('stock').textContent=energy+' / 12 unités';$('energy').value=energy;$('timer-energy').value=energy;$('timer-lamp').textContent=lit()?'DEL allumée':'DEL éteinte';$('timer-lamp').classList.toggle('on',lit());$('lamp-state').textContent=lit()?'Allumée':'Éteinte';
 $('status').textContent=(energy?'Énergie disponible':'Batterie vide')+' · circuit '+($('switch').checked?'fermé':'ouvert')+' · '+(running?'temps accéléré en marche':'temps en pause')+'.';
 $('elapsed').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 $('turn').disabled=turning||running||finished||seconds>0||energy===12;$('turn').textContent=turning?'Tour en cours…':energy===12?'Réserve pleine':'Faire 1 tour de manivelle';
 $('start').disabled=turning||finished||(!running&&!lit());$('start').textContent=running?'Mettre le temps en pause':seconds?'Reprendre le chronomètre':'Lancer le chronomètre';
}
$('turn').addEventListener('click',()=>{if($('turn').disabled)return;turning=true;draw();turnTimeout=setTimeout(()=>{turning=false;energy=Math.min(12,energy+2);turns++;$('timer-status').textContent='Ferme l’interrupteur, puis lance le chronomètre quand la charge choisie est prête.';draw()},700)});
$('switch').addEventListener('change',()=>{if(!$('switch').checked&&running){pause();$('timer-status').textContent='Circuit ouvert : éclairage et chronomètre arrêtés. Referme puis reprends pour poursuivre cet essai.'}else if(!finished){$('timer-status').textContent=lit()?'Prêt : lance le chronomètre pour consommer la réserve.':'Charge la batterie et ferme l’interrupteur pour commencer.'}draw()});
$('inside').addEventListener('change',draw);
$('start').addEventListener('click',()=>{if(running){pause();$('timer-status').textContent='Temps en pause : la réserve est conservée.';draw();return}if(!lit()||finished||turning)return;running=true;$('timer-status').textContent='Chronomètre en marche : observe la réserve jusqu’à l’extinction.';clock=setInterval(()=>{if(!running||!lit())return;energy--;seconds+=60;if(energy===0){pause();finished=true;$('timer-status').textContent='La réserve est épuisée. La lampe s’est éteinte après '+seconds/60+' minutes simulées.';const row=document.createElement('tr');for(const v of [turns,seconds/60+' min']){const c=document.createElement('td');c.textContent=v;row.append(c)}$('results').append(row);$('results-table').hidden=false;$('no-results').hidden=true}draw()},1000);draw()});
$('reset').addEventListener('click',()=>{pause();clearTimeout(turnTimeout);energy=0;turns=0;seconds=0;turning=false;finished=false;$('switch').checked=false;$('timer-status').textContent='Nouvel essai : batterie vide, interrupteur ouvert, chronomètre à zéro.';draw()});
$('new-trial').addEventListener('click',()=>{$('reset').click();$('turn').focus({preventScroll:true})});
$('clear-results').addEventListener('click',()=>{$('results').replaceChildren();$('results-table').hidden=true;$('no-results').hidden=false});
window.addEventListener('pagehide',()=>{pause();clearTimeout(turnTimeout)});draw();
})();