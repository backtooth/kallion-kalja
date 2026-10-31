import {parseSnadi,parseGateHappyHour,parseTapMenu,toText} from './parsers.mjs';

// A known website always wins, even when unavailable or missing prices.
export function selectSources(place){
  if(place.website) return (place.sourcePages?.length?place.sourcePages:[place.website]).map(url=>({kind:'website',url}));
  if(place.facebook) return [{kind:'facebook',url:place.facebook}];
  return [];
}

export async function fetchPage(url){
  const response=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'KallionKalja/1.1 (public restaurant menu check)'}});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const contentType=response.headers.get('content-type')||'';
  if(!/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType))throw new Error('Lähde vaatii käsintarkistuksen (esim. PDF tai kuva).');
  if(Number(response.headers.get('content-length'))>2_000_000)throw new Error('Lähdesivu on liian suuri.');
  const html=await response.text();
  if(html.length>2_000_000)throw new Error('Lähdesivu on liian suuri.');
  return html;
}

export async function checkPlace(place,{read=fetchPage,now=new Date().toISOString()}={}){
  const sources=selectSources(place), checks=[], prices=[];
  for(const source of sources){
    const check={...source,attemptedAt:now};
    if(source.kind==='facebook'&&place.facebookVerified===false){
      checks.push({...check,status:'source_unverified',message:'Löytynyt Facebook-paikkasivu on epävirallinen. Sitä ei käytetä ravintolan omana hintalähteenä.'});
      continue;
    }
    try{
      const html=await read(source.url),text=toText(html);
      check.fetchedAt=now;
      if(source.kind==='facebook'){
        // Feed access is not proof of a price, a post date or offer validity.
        check.status='manual_review';
        check.message=/log in|kirjaudu|temporarily blocked|you must log|see more from|not logged in/i.test(text)||text.length<200?'Facebookin julkaisuja ei voitu vahvistaa automaattisesti. Tarkista sivu selaimella.':'Facebook-sivu haettu. Päivätty hintajulkaisu vaatii käsintarkistuksen.';
      }else{
        let parsed=null;
        if(place.parser==='snadi') parsed={...parseSnadi(html),beer:'Karhu III'};
        else if(place.parser==='gateh11'&&source.url.includes('/happyhours/'))check.offer=parseGateHappyHour(html);
        else parsed=parseTapMenu(html);
        if(parsed){
          check.status='price_verified';check.message='Normaalihinta ja annoskoko luettu omalta verkkosivulta.';
          prices.push({...parsed,source:source.url,sourceLabel:'Ravintolan oma menu',sourceKind:'website',observedAt:now.slice(0,10),checkedAt:now,serving:'draft'});
        }else if(check.offer){check.status='offer_only';check.message='Vain happy hour -hinta. Annoskoko puuttuu; ei normaalihintavertailuun.';}
        else {check.status='price_missing';check.message='Sivu haettu, mutta yksiselitteistä hanaoluen normaalihintaa ja annoskokoa ei löytynyt. Kuva-, PDF- ja JavaScript-menut voivat vaatia käsintarkistuksen.';}
      }
    }catch(error){check.status='fetch_error';check.message=error.name==='TimeoutError'?'Lähteen haku aikakatkaistiin.':error.message==='fetch failed'?'Lähteeseen ei saatu yhteyttä.':error.message;}
    checks.push(check);
  }
  prices.sort((a,b)=>a.price-b.price);
  return {checks,price:prices[0]||null};
}
