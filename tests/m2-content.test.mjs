import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateChapter} from '../assets/js/content.js';
import {askGuide} from '../assets/js/guide.js';
test('bun and tart each provide three validated beats and three card variants',()=>{
 const sources=JSON.parse(readFileSync(new URL('../content/sources.json',import.meta.url)));
 for(const id of ['bun','tart']){const chapter=JSON.parse(readFileSync(new URL(`../content/chapters/${id}.dev.json`,import.meta.url)));assert.equal(validateChapter(chapter,sources,false).id,id);for(const beat of chapter.beats)assert.ok(beat.text.split(/\s+/).length>=70);assert.throws(()=>validateChapter(chapter,sources,true));}
});
test('mock answers use the requested chapter persona and its own sources',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const answer=askGuide({sessionId:'test',chapterId:'bun',personaId:'bakery_auntie',question:'What goes inside this practice bun?',history:[],mode:'phone'});t.mock.timers.tick(400);const result=await answer;assert.equal(result.topicTag,'butter');assert.deepEqual(result.sourceIds,['DEV-BUN-QA-02']);
});
