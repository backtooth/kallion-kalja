import {readFile,writeFile,rename} from 'node:fs/promises';
import {parseSnadi} from './parsers.mjs';
const data=JSON.parse(await readFile('data/venues.json','utf8'));
const now=new Date().toISOString(); data.lastAttemptAt=now;
try {
  const venue=data.venues.find(v=>v.id==='snadi');
  const response=await fetch(venue.source,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'KallionKalja/1.0 (public menu price check)'}});
  if(!response.ok) throw new Error(`Menu vastasi HTTP ${response.status}`);
  const parsed=parseSnadi(await response.text());
  Object.assign(venue,parsed,{checkedAt:now,observedAt:now.slice(0,10)});
  venue.note=parsed.happyHour?`Happy hour ${parsed.happyHour.label}: ${parsed.happyHour.price.toFixed(2).replace('.',',')} € / 0,5 l. Vertailussa normaalihinta.`:'Vertailussa normaalihinta. Happy hour -hintaa ei vahvistettu.';
  data.lastResult='Snadi Pubin menu tarkistettu. Neljä historiallista hintaa odottaa uutta lähdettä.';
}catch(error){
  data.lastResult=`Päivitys epäonnistui: ${error.message} Edellinen hintahavainto säilytettiin.`;
  process.exitCode=1;
}
await writeFile('data/venues.json.tmp',JSON.stringify(data,null,2)+'\n');
await rename('data/venues.json.tmp','data/venues.json');
console.log(data.lastResult);
