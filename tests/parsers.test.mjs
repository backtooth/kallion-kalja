import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSnadi} from '../scripts/parsers.mjs';
test('Valitsee normaalihinnan happy hourin ja ruokayhdistelmän sijaan',()=>{const result=parseSnadi('<p>Karhu + Fries €10</p><h3>Hanasta</h3><b>Karhu III</b><p>0.5L</p><span>€5.80</span><h4>Happy Hour</h4>Ma–pe · 15:00–18:00 Karhu III · 0.5L€4.80');assert.equal(result.price,5.8);assert.equal(result.happyHour.price,4.8);});
test('Hylkää puuttuvan hinnan, koon ja virheellisen hinnan',()=>{for(const input of ['Hanasta Karhu III €5.80','Hanasta Karhu III 0.5L €0','Happy Hour Karhu III 0.5L €4.80'])assert.throws(()=>parseSnadi(input));});
