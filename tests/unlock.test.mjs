import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,transition,validSession} from '../assets/js/state.js';
import {canVisit} from '../assets/js/chapters.js';
test('confirmed unlock opens every chapter without awarding cards or altering existing progress',()=>{
 const s=createSession('phone');s.chapters.tea.storyBeat=1;s.chapters.tea.status='in_progress';
 const next=transition(s,{type:'unlockAll',chapterId:'tea'});
 assert.ok(['tea','bun','tart'].every(id=>canVisit(next,id)));assert.deepEqual(next.cards,[]);assert.equal(next.chapters.tea.storyBeat,1);assert.ok(validSession(next));
 assert.deepEqual(transition(next,{type:'unlockAll'}).chapters,next.chapters);
});
