(() => {
'use strict';
const data=JSON.parse(document.getElementById('guide-data').textContent);
const nav=document.querySelector('.sessions'),card=document.querySelector('#lesson');
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
function render(){
 const match=/^#seance-([1-7])$/.exec(location.hash);const n=match&&Number(match[1])<=data.sessions.length?Number(match[1]):1;
 nav.replaceChildren();data.sessions.forEach((s,i)=>{const a=make('a','Séance '+(i+1));a.href='#seance-'+(i+1);a.title=s.title;if(i+1===n)a.setAttribute('aria-current','step');nav.append(a);});
 const s=data.sessions[n-1];card.replaceChildren();
 card.append(make('p','Séance '+n+' sur '+data.sessions.length,'eyebrow'),make('h2',s.title),make('p',s.goal,'goal'));
 const layout=make('div',null,'layout'),ol=make('ol',null,'actions');s.actions.forEach(t=>ol.append(make('li',t)));
 const proof=make('aside',null,'proof');proof.append(make('h3','À montrer au professeur'),make('p',s.proof));layout.append(ol,proof);card.append(layout);
 const details=make('details');details.append(make('summary','Besoin d’aide ?'),make('p',s.hint));card.append(details);
 if(data.topics&&n===1){const d=make('details');d.append(make('summary','Les sujets au choix'));const t=make('div',null,'topics');data.topics.forEach(x=>t.append(make('span',x)));d.append(t);card.append(d);}
 if(s.tool){
  const tools=make('div',null,'tools'),b=make('button','Ouvrir les outils de cette séance');b.type='button';b.setAttribute('aria-expanded','false');
  const box=make('div');box.hidden=true;b.onclick=()=>{box.hidden=!box.hidden;b.setAttribute('aria-expanded',String(!box.hidden));b.textContent=box.hidden?'Ouvrir les outils de cette séance':'Masquer les outils';if(!box.childElementCount){
   const url=new URL('../../'+s.tool+'/',location.href);url.hash='';
   const f=make('iframe',null,'frame');f.title='Outils : '+s.title;f.src=url.href;f.allow='fullscreen';box.append(make('p','Utilisez les questions indiquées dans les consignes ci-dessus. Notez vos résultats dans votre propre document.','muted'),f);
  }};tools.append(b,box);card.append(tools);
 }
 const controls=make('nav',null,'nav');controls.setAttribute('aria-label','Changer de séance');for(const [delta,label]of[[-1,'← Séance précédente'],[1,'Séance suivante →']])if(n+delta>=1&&n+delta<=data.sessions.length){const a=make('a',label,'button');a.href='#seance-'+(n+delta);controls.append(a);}card.append(controls);
 document.title=data.grade+' · '+data.title+' · Séance '+n;
}
window.addEventListener('hashchange',()=>{render();document.querySelector('#lesson').scrollIntoView({block:'start'});});render();
})();