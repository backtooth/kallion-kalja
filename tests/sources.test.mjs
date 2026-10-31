import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectSources,checkPlace} from '../scripts/sources.mjs';
import {parseGateHappyHour,parseTapMenu} from '../scripts/parsers.mjs';

test('Oma verkkosivu valitaan aina ennen Facebookia',()=>{
  assert.deepEqual(selectSources({website:'https://bar.example',facebook:'https://facebook.com/bar'}),[{kind:'website',url:'https://bar.example'}]);
  assert.deepEqual(selectSources({website:null,facebook:'https://facebook.com/bar'}),[{kind:'facebook',url:'https://facebook.com/bar'}]);
});
test('Puuttuva hinta tai verkkovirhe ei vaihda Facebookiin',async()=>{
  const place={website:'https://bar.example',facebook:'https://facebook.com/bar'};
  for(const read of [async()=>'<h2>Menu</h2>Pizza 12,00 €',async()=>{throw new Error('HTTP 503');}]){
    const result=await checkPlace(place,{read});
    assert.equal(result.price,null);assert.equal(result.checks.length,1);assert.equal(result.checks[0].kind,'website');
  }
});
test('Facebookin kirjautumissivu ei vahvista hintaa',async()=>{
  const result=await checkPlace({facebook:'https://facebook.com/bar'},{read:async()=>'<h1>Log in</h1>Karhu 0.5L €1.00'});
  assert.equal(result.price,null);assert.equal(result.checks[0].status,'manual_review');
});
test('Epävirallista Facebook-paikkasivua ei käsitellä omana hintalähteenä',async()=>{
  let fetched=false;
  const result=await checkPlace({facebook:'https://facebook.com/bar',facebookVerified:false},{read:async()=>{fetched=true;return '<h1>Unofficial page</h1>';}});
  assert.equal(fetched,false);assert.equal(result.price,null);assert.equal(result.checks[0].status,'source_unverified');
});
test('Hyväksyy hanaoluen kokonaisen rivin ja hylkää pullot, ruoan, häppärit sekä puuttuvan koon',()=>{
  assert.deepEqual(parseTapMenu('<h2>Hanaoluet</h2><ul><li>Karhu III 0,5 l 5,80 €</li><li>Lonkero 0,5 l 4,00 €</li></ul><h2>Pullot</h2><li>Olut 0,5 l 2,00 €</li>'),{beer:'Karhu III',price:5.8,litres:0.5,happyHour:null});
  for(const html of ['<h2>Ruoka</h2><li>Olut + pizza 0,5 l 5,00 €</li>','<h2>Hanaoluet</h2><li>Karhu 5,00 €</li>','<h2>Hanaoluet</h2>Happy hour<li>Karhu 0,5 l 3,00 €</li>','<h2>Beers · 50 cl</h2><li>Efes Lager 7,20 €</li>'])assert.equal(parseTapMenu(html),null);
});
test('Gate H11:n häppäri pysyy erillisenä tarjouksena ilman keksittyä annoskokoa',()=>{
  const offer=parseGateHappyHour('AFTER WORK Sun-Thu 4pm-8pm Fri-Sat 3pm-8pm Aura 4,80 € Selected Wines');
  assert.equal(offer.price,4.8);assert.equal(offer.litres,null);assert.equal(offer.type,'happy_hour');
});
