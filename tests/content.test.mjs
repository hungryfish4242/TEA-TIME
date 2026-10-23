import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateChapter} from '../assets/js/content.js';
/** Read the actual chapter used in the browser. @returns {object} */
function chapter(){return JSON.parse(readFileSync(new URL('../content/chapters/tea.dev.json',import.meta.url)));}
const sources=()=>JSON.parse(readFileSync(new URL('../content/sources.json',import.meta.url)));
test('development chapter has three usable beats and variants, but cannot pass production',()=>{
 const c=chapter();assert.equal(validateChapter(c,sources(),false).id,'tea');
 assert.equal(c.beats.length,3);assert.equal(c.cards.length,3);
 for(const beat of c.beats){const n=beat.text.split(/\s+/).length;assert.ok(n>=70&&n<=110);assert.equal(beat.transcript,beat.text);}
 assert.throws(()=>validateChapter(c,sources(),true),/development/i);
});
test('content rejects invalid guide, topic, index, variant and source reference',()=>{
 for(const change of [c=>c.guideId='unknown',c=>c.qa.suggested[0].topicTag='unknown',c=>c.quiz.correctIndex=9,c=>c.defaultCardVariant='missing',c=>c.cards[0].sourceId='missing',c=>c.beats.pop()]){
   const c=chapter();change(c);assert.throws(()=>validateChapter(c,sources(),false));
 }
});
test('production rejects source-free factual fields even when development flags are removed',()=>{
 const c=chapter();c.devOnly=false;assert.throws(()=>validateChapter(c,[],true));
});
