export function toText(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;|&#xA0;/gi,' ').replace(/&euro;|&#8364;/gi,'€').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
export function parseSnadi(html){
  const text=toText(html);
  const section=text.split(/Hanasta/i)[1]?.split(/Happy Hour/i)[0];
  const match=section?.match(/Karhu III\s+0[.,]5\s*L\s*€\s*(\d{1,2}(?:[.,]\d{1,2})?)/i);
  if(!match) throw new Error('Menun rakenne muuttui: normaalia 0,5 l Karhu III -hintaa ei löytynyt.');
  const price=Number(match[1].replace(',','.'));
  if(price<1 || price>25) throw new Error('Hinta ei läpäissyt tarkistusta.');
  const hh=text.split(/Happy Hour/i)[1]?.match(/Ma[–-]pe\s*[·•]?\s*15:00[–-]18:00\s+Karhu III\s*[·•]?\s*0[.,]5L\s*€\s*(\d{1,2}(?:[.,]\d{1,2})?)/i);
  return {price,litres:0.5,happyHour:hh?{price:Number(hh[1].replace(',','.')),litres:0.5,label:'Ma–pe 15–18'}:null};
}

export function parseGateHappyHour(html){
  const text=toText(html);
  const section=text.split(/AFTER WORK/i)[1]?.split(/Selected Wines/i)[0];
  const match=section?.match(/Aura\s+(\d{1,2}[.,]\d{2})\s*€/i);
  if(!match||!/Sun[–-]Thu\s+4pm[–-]8pm\s+Fri[–-]Sat\s+3pm[–-]8pm/i.test(section))return null;
  return {beer:'Aura',price:Number(match[1].replace(',','.')),litres:null,label:'Su–to 16–20, pe–la 15–20',type:'happy_hour'};
}

// Only explicit draught sections and complete list/table rows are accepted.
export function parseTapMenu(html){
  const headings=[...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const offers=[];
  for(let i=0;i<headings.length;i++){
    const heading=headings[i],label=toText(heading[2]);
    if(!/^(hanaoluet|hanaolut|hanasta|draught beers?|on tap)$/i.test(label))continue;
    const next=headings.slice(i+1).find(h=>Number(h[1])<=Number(heading[1]));
    const section=html.slice(heading.index+heading[0].length,next?.index||html.length);
    if(/happy hour|after.?work|tarjous|opiskelija|jäsenhinta/i.test(toText(section)))continue;
    for(const row of section.matchAll(/<(li|tr)\b[^>]*>([\s\S]*?)<\/\1>/gi)){
      const text=toText(row[2]);
      if(/siideri|cider|lonkero|long drink|alkoholiton|non.alcohol|0[.,]0\s*%|0\s*%|bottle|pullo/i.test(text))continue;
      const match=text.match(/^([\p{L}\d\s.,'’%()\-–]+?)\s+(0[.,][45])\s*l\s+(?:€\s*(\d{1,2}[.,]\d{2})|(\d{1,2}[.,]\d{2})\s*€)$/iu);
      if(!match)continue;
      const price=Number((match[3]||match[4]).replace(',','.'));
      if(price>=1&&price<=25)offers.push({beer:match[1].trim(),litres:Number(match[2].replace(',','.')),price,happyHour:null});
    }
  }
  return offers.sort((a,b)=>a.price-b.price)[0]||null;
}
