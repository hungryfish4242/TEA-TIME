import test from 'node:test';
import assert from 'node:assert/strict';
import {certificateName,canGenerate} from '../assets/js/certificate.js';
import {createSession,transition} from '../assets/js/state.js';
test('blank names have a generic label and unicode names have a 24-character boundary',()=>{
 assert.equal(certificateName('  '),'A visitor');assert.equal(certificateName('Alex'),'Alex');assert.equal([...certificateName('茶'.repeat(30))].length,24);assert.equal(certificateName('<b>Alex</b>'),'<b>Alex</b>');
});
test('certificates require three distinct cards and dev completion cannot bypass tea',()=>{
 let s=createSession('phone');assert.equal(canGenerate(s),false);assert.deepEqual(transition(s,{type:'devComplete',dev:true}).cards,[]);
 assert.equal(canGenerate({...s,cards:['tea','tea','tea']}),false);assert.equal(canGenerate({...s,cards:['tea','bun','tart']}),true);
});
