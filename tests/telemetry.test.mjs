import test from 'node:test';
import assert from 'node:assert/strict';
import {createTelemetry} from '../assets/js/telemetry.js';
/** Storage boundary for event tests. @returns {object} */
function storage(){const data={};return {read:k=>data[k]??null,write:(k,v)=>data[k]=structuredClone(v)};}
test('events are idempotent, private fields excluded, manifest counts actual records',async()=>{
 const store=storage(),events=createTelemetry(store,'session');
 events.record('session_start',{mode:'phone',appVersion:'0.1',name:'Secret'},'start');events.record('session_start',{mode:'phone',appVersion:'0.1'},'start');
 events.record('qa_question_submit',{chapterId:'tea',source:'free',latencyMs:0,question:'private'},'q1');
 const payload=JSON.parse(await events.export().text());assert.equal(payload.manifest.eventCount,2);assert.equal(JSON.stringify(payload).includes('private'),false);assert.equal(JSON.stringify(payload).includes('Secret'),false);
});
test('event cap preserves earlier evidence and returns overflow status',()=>{
 const store=storage(),events=createTelemetry(store,'session');for(let i=0;i<2000;i++)events.record('error',{code:String(i),chapterId:'tea',screen:'qa'});
 assert.equal(events.record('error',{code:'overflow'}),false);assert.equal(store.read('events').length,2000);assert.equal(store.read('events')[0].fields.code,'0');
});
