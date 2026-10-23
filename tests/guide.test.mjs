import test from 'node:test';
import assert from 'node:assert/strict';
import {askGuide,validateResponse,GuideError} from '../assets/js/guide.js';
/** Create an exact guide request contract. @param {string} question @returns {object} */
function request(question){return {sessionId:'test',chapterId:'tea',personaId:'tea_master',question,history:[],mode:'phone'};}
test('mock chips resolve after 400 ms with their own topic/source and free text has default source',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const promise=askGuide(request('Can I skip a question?'));t.mock.timers.tick(400);const r=await promise;
 assert.equal(r.topicTag,'ratio');assert.deepEqual(r.sourceIds,['DEV-QA-02']);assert.ok(r.answer.split(/\s+/).length<=90);
 const free=askGuide(request('hello'));t.mock.timers.tick(400);assert.deepEqual((await free).sourceIds,['DEV-QA-01']);
});
test('request and response boundaries reject invalid content',async()=>{
 await assert.rejects(askGuide(request('x'.repeat(121))),GuideError);
 const base={answer:'Safe sample',sourceIds:['DEV-QA-01'],topicTag:'craft',safety:'ok',suggestedFollowUp:null};
 assert.equal(validateResponse(base).topicTag,'craft');
 for(const patch of [{sourceIds:['fake']},{topicTag:'fake'},{answer:'word '.repeat(91)},{safety:'fake'}])assert.throws(()=>validateResponse({...base,...patch}),GuideError);
 assert.equal(validateResponse({...base,answer:'<b>Text only</b>'}).answer,'<b>Text only</b>');
});
