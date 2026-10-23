import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivity,advanceActivity} from '../assets/js/activities.js';
test('bun requires split butter close and rejects distractors without a dead end',()=>{
 let s=initialActivity('bun');s=advanceActivity(s,'close');assert.equal(s.step,0);s=advanceActivity(s,'split');s=advanceActivity(s,'pineapple');assert.equal(s.step,1);assert.equal(s.complete,false);s=advanceActivity(s,'butter');s=advanceActivity(s,'close');assert.equal(s.complete,true);
});
test('tart inspections are optional and wrong selection allows a corrected choice',()=>{
 let s=initialActivity('tart');s=advanceActivity(s,'shortcrust');assert.equal(s.complete,false);s=advanceActivity(s,'inspect-puff');assert.equal(s.inspected.includes('puff'),true);s=advanceActivity(s,'puff');assert.equal(s.complete,true);
 assert.equal(advanceActivity(initialActivity('tart'),'puff').complete,true);
});
