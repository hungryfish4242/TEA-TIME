import test from 'node:test';
import assert from 'node:assert/strict';
import {createKioskController} from '../assets/js/kiosk.js';
test('entry attract appears at 45 seconds and activity preserves the visit',t=>{
 t.mock.timers.enable({apis:['setInterval','Date'],now:0});let attracted=false,resets=0;
 const k=createKioskController({route:()=> '#/',onAttract:v=>attracted=v,onCountdown:()=>{},onReset:()=>resets++});
 t.mock.timers.tick(44999);assert.equal(attracted,false);t.mock.timers.tick(1);assert.equal(attracted,true);k.activity();assert.equal(attracted,false);assert.equal(resets,0);k.stop();
});
test('certificate resets after 60 seconds plus 10-second cancelable countdown',t=>{
 t.mock.timers.enable({apis:['setInterval','Date'],now:0});let countdown=null,resets=0;
 const k=createKioskController({route:()=> '#/certificate',onAttract:()=>{},onCountdown:v=>countdown=v,onReset:()=>resets++});
 t.mock.timers.tick(60000);assert.equal(countdown,10);k.activity();assert.equal(countdown,null);t.mock.timers.tick(60000);assert.equal(countdown,10);t.mock.timers.tick(10000);assert.equal(resets,1);k.stop();
});
test('chapter work is never reset by idle kiosk timers',t=>{
 t.mock.timers.enable({apis:['setInterval','Date'],now:0});let resets=0,attracted=false;
 const k=createKioskController({route:()=> '#/tea',onAttract:v=>attracted=v,onCountdown:()=>{},onReset:()=>resets++});
 t.mock.timers.tick(3600000);assert.equal(resets,0);assert.equal(attracted,false);k.stop();
});
