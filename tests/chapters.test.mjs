import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,transition,deriveStep,validSession} from '../assets/js/state.js';
import {resolveRoute} from '../assets/js/router.js';
/** Complete one chapter through the public transition contract. @param {object} s @param {string} id @returns {object} */
function finish(s,id){
 const action=(type,fields={})=>{s=transition(s,{type,chapterId:id,...fields});};
 action('startChapter');for(let i=0;i<3;i++)action('beat');
 action('interaction',{value:id==='tea'?{status:'complete',attempts:1,usedSteadyMode:true,lastCompletedPour:4,goodPours:0}:{status:'complete',attempts:1,usedSteadyMode:false}});
 action('skipQa');action('quiz',{correct:true});action('collect');return s;
}
test('normal visitors unlock and complete all three chapters in sequence',()=>{
 let s=createSession('phone');assert.equal(resolveRoute('#/tart',s),'#/order');
 s=finish(s,'tea');assert.equal(resolveRoute('#/bun',s),'#/bun');assert.equal(resolveRoute('#/tart',s),'#/order');
 s=finish(s,'bun');assert.equal(validSession(s),true);assert.deepEqual(s.cards,['tea','bun']);
 s=finish(s,'tart');assert.equal(validSession(s),true);assert.deepEqual(s.cards,['tea','bun','tart']);assert.equal(resolveRoute('#/certificate',s),'#/certificate');
});
test('locked chapters cannot be started by direct state actions',()=>{
 const s=transition(createSession('phone'),{type:'startChapter',chapterId:'tart'});assert.equal(s.chapters.tart.status,'locked');
});
test('chapter-specific topics and reload checkpoints do not modify previous cards',()=>{
 let s=finish(createSession('phone'),'tea');s=transition(s,{type:'startChapter',chapterId:'bun'});s=transition(s,{type:'beat',chapterId:'bun'});
 assert.equal(deriveStep(s,'bun'),'story');assert.equal(s.chapters.bun.storyBeat,1);assert.equal(s.chapters.tea.card.variantId,'craft');assert.equal(validSession(s),true);
});
test('development completion preserves chapters already earned through the normal journey',()=>{
 let s=finish(finish(createSession('phone'),'tea'),'bun');s.chapters.bun.card.variantId='butter';const earned=structuredClone(s.chapters.bun);
 s=transition(s,{type:'devComplete',chapterId:'tea',dev:true});assert.deepEqual(s.chapters.bun,earned);
});
