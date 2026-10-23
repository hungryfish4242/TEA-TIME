import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyPour,recordPour,startRound} from '../assets/js/tea.js';
/** Starting state at the tea table. @returns {object} */
function initial(){return {status:'not_started',attempts:0,goodPours:0,usedSteadyMode:false,lastCompletedPour:0};}
test('timing boundaries include 120 ms perfect and 250 ms good',()=>{
 for(const [time,result] of [[-120,'perfect'],[120,'perfect'],[121,'good'],[-250,'good'],[250,'good'],[251,'miss']])assert.equal(classifyPour(time,250),result);
 assert.equal(classifyPour(350,350),'good');
});
test('three good pours finish and repeat taps for the same beat do not count',()=>{
 let s=startRound(initial(),false);s=recordPour(s,0,'good');const same=recordPour(s,0,'perfect');assert.deepEqual(same,s);
 s=recordPour(s,1,'perfect');s=recordPour(s,2,'miss');s=recordPour(s,3,'good');assert.equal(s.status,'complete');assert.equal(s.goodPours,3);
 assert.deepEqual(recordPour(s,4,'good'),s);
});
test('one retry is allowed and completes even when all pours miss',()=>{
 let s=startRound(initial(),false);for(let i=0;i<4;i++)s=recordPour(s,i,'miss');assert.equal(s.status,'retry');
 s=startRound(s,false);assert.equal(s.attempts,2);for(let i=0;i<4;i++)s=recordPour(s,i,'miss');assert.equal(s.status,'complete');assert.equal(startRound(s,false).attempts,2);
});
test('steady mode finishes four taps and resuming retains completed pours',()=>{
 let s=startRound(initial(),true);s=recordPour(s,0,'steady');s=recordPour(s,1,'steady');s=startRound(s,true);assert.equal(s.lastCompletedPour,2);assert.equal(s.attempts,1);
 s=recordPour(s,2,'steady');s=recordPour(s,3,'steady');assert.equal(s.status,'complete');assert.equal(s.goodPours,0);
});
