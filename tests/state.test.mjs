import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, transition, deriveStep, validSession } from '../assets/js/state.js';
import { resolveRoute } from '../assets/js/router.js';

test('fresh visits lock missing chapters and reject direct finale links', () => {
  const s = createSession('phone');
  assert.equal(s.chapters.tea.status, 'available');
  assert.equal(resolveRoute('#/bun', s), '#/order');
  assert.equal(resolveRoute('#/certificate', s), '#/order');
  assert.equal(resolveRoute('#/unknown', s), '#/');
  assert.equal(deriveStep(s), 'intro');
});
test('checkpoints derive story, interaction, QA, quiz and reveal without duplicate cards', () => {
  let s = transition(createSession('phone'), { type: 'startChapter' });
  assert.equal(deriveStep(s), 'story');
  for (let i=0; i<3; i++) s = transition(s, {type:'beat'});
  assert.equal(deriveStep(s), 'interaction');
  s = transition(s, { type:'interaction', value:{status:'complete', attempts:1, usedSteadyMode:true, lastCompletedPour:4, goodPours:0} });
  assert.equal(deriveStep(s), 'qa');
  s = transition(s, {type:'skipQa'});
  assert.equal(deriveStep(s), 'quiz');
  s = transition(s, {type:'quiz', correct:false});
  s = transition(s, {type:'quiz', correct:false});
  assert.deepEqual(s.cards, []);
  assert.equal(deriveStep(s), 'quiz');
  s = transition(s, {type:'quiz', correct:true});
  assert.equal(deriveStep(s), 'reveal');
  assert.equal(s.chapters.tea.quiz.firstTryCorrect, false);
  s = transition(s, {type:'quiz', correct:true});
  assert.deepEqual(s.cards, ['tea']);
});
test('QA cap and skip default are enforced by state, not only UI', () => {
  let s = createSession('phone'); s.chapters.tea.interaction.status='complete'; s.chapters.tea.storyBeat=3;
  for (let i=0;i<3;i++) s=transition(s,{type:'answer',topicTag:'ratio',sourceIds:['DEV-QA-02']});
  assert.equal(s.chapters.tea.qa.turns,2);
  s=transition(s,{type:'skipQa'});
  assert.equal(s.chapters.tea.qa.topicTag,null);
});
test('invalid sessions fail validation and early quiz cannot unlock a card', () => {
  const s=createSession('kiosk'); assert.equal(validSession(s), true);
  assert.equal(validSession({...s,schemaVersion:2}), false);
  assert.equal(validSession({...s,chapters:{}}), false);
  assert.deepEqual(transition(s,{type:'quiz',correct:true}).cards,[]);
});
test('completed quiz without its card is rejected before the reveal screen can crash',()=>{
 const s=createSession('phone');s.chapters.tea.status='in_progress';s.chapters.tea.storyBeat=3;s.chapters.tea.interaction.status='complete';s.chapters.tea.qa.status='skipped';s.chapters.tea.quiz.status='complete';assert.equal(validSession(s),false);
});
