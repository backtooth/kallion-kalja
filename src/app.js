const list=document.querySelector('#venues');
const euro=n=>new Intl.NumberFormat('fi-FI',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const date=s=>s?new Intl.DateTimeFormat('fi-FI',{timeZone:'Europe/Helsinki'}).format(new Date(s)):'Ei vielä tarkistettu';
const fresh=v=>Number.isFinite(v.price)&&v.serving==='draft'&&['website','facebook','menu'].includes(v.sourceKind)&&(Date.now()-Date.parse(v.checkedAt||v.observedAt))/86400000<=30;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label,cls='source')=>`<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
let data,filter='fresh';

function render(){
  const sort=document.querySelector('#sort').value;
  const rows=data.venues.filter(v=>Number.isFinite(v.price)&&['website','facebook','menu'].includes(v.sourceKind)&&(filter==='all'||fresh(v)));
  rows.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'fi'):sort==='litre'?((a.litres?a.price/a.litres:Infinity)-(b.litres?b.price/b.litres:Infinity)||a.price-b.price):a.price-b.price);
  list.innerHTML=rows.slice(0,5).map((v,i)=>`<article class="venue"><div class="place"><span class="rank">${String(i+1).padStart(2,'0')}</span><div><h3>${escape(v.name)}</h3><span class="address">${escape(v.address)} · ${escape(v.area)}</span><br>${link(v.source,v.sourceLabel)}</div></div><div class="price">${euro(v.price)} <small>€</small><span class="sub">${v.litres?String(v.litres).replace('.',',')+' l · '+euro(v.price/v.litres)+' €/l':'Annoskoko ei tiedossa'}</span><span class="sub">${escape(v.beer)}</span></div><div><span class="status ${fresh(v)?'fresh':''}">${fresh(v)?'OMA HINTALÄHDE':'VANHA HAVAINTO'}</span><p class="date">Hintahavainto ${date(v.checkedAt||v.observedAt)}</p><p class="note">${escape(v.note)}</p></div>${link(v.mapsUrl,'Kartalle','maps')}</article>`).join('')||'<p class="empty">Valitulla rajauksella ei ole vahvistettuja tuoppihintoja. Ravintoloiden hintalähteet löytyvät alta.</p>';
  if(rows.length&&rows.length<5)list.insertAdjacentHTML('beforeend',`<p class="table-note">${rows.length}/5 hintaa saatavilla. Lista täydentyy, kun lisää ravintoloiden omia tuoppihintoja saadaan vahvistettua.</p>`);
}

function renderDirectory(){
  const labels={price_verified:'Hinta vahvistettu',offer_only:'Vain tarjoushinta',price_missing:'Tuoppihinta puuttuu',fetch_error:'Lähteen haku epäonnistui',manual_review:'Facebook: käsintarkistus',source_unverified:'Oma lähde varmentamatta'};
  document.querySelector('#place-count').textContent=`${data.venues.length} paikkaa Mapsista`;
  document.querySelector('#discovery-status').textContent=`Paikkalista koottu ${date(data.discovery.date)} Google Mapsista. Uusia paikkoja lisätään käsin; päivittäinen ajo tarkistaa listan hintalähteet.`;
  document.querySelector('#places').innerHTML=data.venues.map(v=>`<details class="source-place"><summary><span><strong>${escape(v.name)}</strong><small>${escape(v.address)} · ${escape(v.area)}</small></span><span class="status ${fresh(v)?'fresh':''}">${fresh(v)?'Hinta vahvistettu':v.website?'Oma verkkosivu':v.facebookVerified===false?'Oma lähde puuttuu':'Facebook-varalähde'}</span></summary><div class="source-detail"><p>${link(v.mapsUrl,'Löydetty Google Mapsista')}${v.website?' · '+link(v.website,'Ravintolan oma verkkosivu'):v.facebook?' · '+link(v.facebook,v.facebookVerified===false?'Facebook-ehdokas (epävirallinen)':'Ravintolan Facebook'):''}</p>${v.website?'':v.facebookVerified===false?'<p>Ravintolan oma hintalähde odottaa varmennusta.</p>':'<p>Omaa erillistä verkkosivustoa ei löytynyt. Hintaa etsitään ravintolan Facebook-sivulta.</p>'}${(v.sourceChecks||[]).map(c=>`<div class="source-check"><strong>${escape(labels[c.status]||c.status)}</strong><p>${link(c.url,c.kind==='facebook'?'Facebook-lähde':'Tarkistettu sivu')} · Hakuyritys ${date(c.attemptedAt)}</p><p>${escape(c.message)}</p>${c.offer?`<p class="offer"><strong>${escape(c.offer.beer)} ${euro(c.offer.price)} €</strong> · ${escape(c.offer.label)}. Annoskoko ei tiedossa. Tarjous on erillinen tieto, eikä vaikuta normaalihintojen järjestykseen.</p>`:''}</div>`).join('')}${v.manualReview?`<p>Käsin tarkistettu ${date(v.manualReview.date)}: ${escape(v.manualReview.result)}</p>`:''}</div></details>`).join('');
}

try{
  const response=await fetch('./data/venues.json',{cache:'no-store'});
  if(!response.ok)throw new Error();
  data=await response.json();
  document.querySelector('#updated').textContent=`${Math.min(5,data.venues.filter(fresh).length)}/5 tuoretta hintaa · ${data.venues.length} paikkaa seurannassa`;
  document.querySelector('#run-status').textContent=(data.lastAttemptAt?'Viimeisin ajo '+date(data.lastAttemptAt)+'. ':'')+data.lastResult;
  render();renderDirectory();
  document.querySelector('#sort').addEventListener('change',render);
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    filter=b.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
    render();
  }));
}catch{
  list.textContent='Hintatietoja ei voitu ladata. Yritä ladata sivu uudelleen.';
  document.querySelector('#updated').textContent='Tietojen lataus epäonnistui';
}
