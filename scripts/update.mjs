import {readFile,writeFile,rename} from 'node:fs/promises';
import {checkPlace} from './sources.mjs';
const data=JSON.parse(await readFile('data/venues.json','utf8'));
const registry=JSON.parse(await readFile('data/places.json','utf8'));
const now=new Date().toISOString(),venues=[];
let verified=0,errors=0;
for(let i=0;i<registry.places.length;i+=3){
  const results=await Promise.all(registry.places.slice(i,i+3).map(async place=>{
    const previous=data.venues.find(v=>v.id===place.id);
    const result=await checkPlace(place,{now});
    if(result.price)verified++;
    errors+=result.checks.filter(c=>c.status==='fetch_error').length;
    const previousPrice=previous&&['website','facebook','menu'].includes(previous.sourceKind)?{
      price:previous.price,litres:previous.litres,beer:previous.beer,source:previous.source,sourceLabel:previous.sourceLabel,sourceKind:previous.sourceKind,observedAt:previous.observedAt,checkedAt:previous.checkedAt,serving:previous.serving||'draft',happyHour:previous.happyHour||null
    }:{};
    const price=result.price||previousPrice;
    const note=price.happyHour?`Happy hour ${price.happyHour.label}: ${price.happyHour.price.toFixed(2).replace('.',',')} € / ${String(price.happyHour.litres).replace('.',',')} l. Vertailussa normaalihinta.`:result.price?'Vertailussa ravintolan oma normaalihinta.':previousPrice.price?'Viimeisin hintahavainto säilytetty. Uusi tarkistus ei vahvistanut hintaa.':'Tuoppihinta odottaa vahvistusta ravintolan omasta lähteestä.';
    return {...place,...price,note,sourceChecks:result.checks};
  }));
  venues.push(...results);
}
data.venues=venues;
data.discovery={date:registry.discoveredAt,url:registry.discoveryUrl,method:registry.discoveryMethod,note:registry.discoveryNote};
data.lastAttemptAt=now;
data.lastResult=`${venues.length} Mapsista löydettyä paikkaa. ${verified} normaalihintaa vahvistettu tässä ajossa. ${errors} lähteen haku epäonnistui. Facebook-julkaisut vaativat käsintarkistuksen.`;
await writeFile('data/venues.json.tmp',JSON.stringify(data,null,2)+'\n');
await rename('data/venues.json.tmp','data/venues.json');
console.log(data.lastResult);
if(errors)process.exitCode=1;
