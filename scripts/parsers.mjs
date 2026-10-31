export function parseSnadi(html){
  const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
  const section=text.split(/Hanasta/i)[1]?.split(/Happy Hour/i)[0];
  const match=section?.match(/Karhu III\s+0[.,]5\s*L\s*€\s*(\d{1,2}(?:[.,]\d{1,2})?)/i);
  if(!match) throw new Error('Menun rakenne muuttui: normaalia 0,5 l Karhu III -hintaa ei löytynyt.');
  const price=Number(match[1].replace(',','.'));
  if(price<1 || price>25) throw new Error('Hinta ei läpäissyt tarkistusta.');
  const hh=text.split(/Happy Hour/i)[1]?.match(/Ma[–-]pe\s*[·•]?\s*15:00[–-]18:00\s+Karhu III\s*[·•]?\s*0[.,]5L\s*€\s*(\d{1,2}(?:[.,]\d{1,2})?)/i);
  return {price,litres:0.5,happyHour:hh?{price:Number(hh[1].replace(',','.')),litres:0.5,label:'Ma–pe 15–18'}:null};
}
