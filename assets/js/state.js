import {CHAPTERS,CHAPTER_IDS,canVisit} from './chapters.js';
/** @typedef {{status:string,attempts:number,goodPours:number,usedSteadyMode:boolean,lastCompletedPour:number}} TeaInteraction */
/** @typedef {{status:string,storyBeat:number,qa:{status:string,topicTag:string|null,turns:number,sourceIds:string[]},interaction:TeaInteraction,quiz:{status:string,attempts:number,firstTryCorrect:boolean|null},card:{variantId:string|null,unlockedAt:string|null}} TeaChapter */
/** @typedef {{schemaVersion:number,sessionId:string,mode:string,startedAt:string,updatedAt:string,stage:string,currentChapter:string|null,chapters:{tea:TeaChapter,bun:object,tart:object},cards:string[],certificate:{generatedAt:string|null,downloadedAt:string|null,sharedAt:string|null}}} Session */
/** @typedef {{type:string,value?:any,correct?:boolean,topicTag?:string,sourceIds?:string[],dev?:boolean}} Action */

/** Create an empty visit in the published schema. @param {string} mode @returns {Session} */
export function createSession(mode) {
  const now=new Date().toISOString();
  return {schemaVersion:1,sessionId:crypto.randomUUID(),mode,startedAt:now,updatedAt:now,stage:'entry',currentChapter:null,
    chapters:{tea:{status:'available',storyBeat:0,qa:{status:'not_started',topicTag:null,turns:0,sourceIds:[]},interaction:{status:'not_started',attempts:0,goodPours:0,usedSteadyMode:false,lastCompletedPour:0},quiz:{status:'not_started',attempts:0,firstTryCorrect:null},card:{variantId:null,unlockedAt:null}},bun:{status:'locked'},tart:{status:'locked'}},
    cards:[],certificate:{generatedAt:null,downloadedAt:null,sharedAt:null}};
}
/** Create a full chapter object when its table becomes available. @param {string} id @returns {object} */
export function createChapter(id){return {status:'available',storyBeat:0,qa:{status:'not_started',topicTag:null,turns:0,sourceIds:[]},interaction:id==='tea'?{status:'not_started',attempts:0,goodPours:0,usedSteadyMode:false,lastCompletedPour:0}:{status:'not_started',attempts:0,usedSteadyMode:false},quiz:{status:'not_started',attempts:0,firstTryCorrect:null},card:{variantId:null,unlockedAt:null}};}
/** Validate saved state, including each chapter and legacy development-filled cards. @param {unknown} value @returns {boolean} */
export function validSession(value){
 const s=value;
 if(!s||s.schemaVersion!==1||typeof s.sessionId!=='string'||!['phone','kiosk'].includes(s.mode)||!['entry','order','chapter','scene','certificate'].includes(s.stage)||!Number.isFinite(Date.parse(s.startedAt))||!Number.isFinite(Date.parse(s.updatedAt))||!s.chapters||!s.certificate||!Array.isArray(s.cards)||new Set(s.cards).size!==s.cards.length||!s.cards.every(id=>CHAPTER_IDS.includes(id)))return false;
 return CHAPTER_IDS.every(id=>{
  const c=s.chapters[id],meta=CHAPTERS[id];if(!c||!['locked','available','in_progress','complete'].includes(c.status))return false;
  if(c.status==='locked')return id!=='tea'&&!s.cards.includes(id);
  if(!c.qa)return id!=='tea'&&c.status==='complete'&&s.cards.includes(id)&&c.card&&typeof c.card.variantId==='string'&&typeof c.card.unlockedAt==='string';
  if(!Number.isInteger(c.storyBeat)||c.storyBeat<0||c.storyBeat>3||!['not_started','in_progress','answered','skipped'].includes(c.qa.status)||!Number.isInteger(c.qa.turns)||c.qa.turns<0||c.qa.turns>2||!Array.isArray(c.qa.sourceIds)||!c.qa.sourceIds.every(x=>typeof x==='string')||!(c.qa.topicTag===null||meta.topics.includes(c.qa.topicTag)))return false;
  if(!c.interaction||!['not_started','in_progress','retry','complete'].includes(c.interaction.status)||!Number.isInteger(c.interaction.attempts)||c.interaction.attempts<0||!c.quiz||!['not_started','in_progress','complete'].includes(c.quiz.status)||!Number.isInteger(c.quiz.attempts)||c.quiz.attempts<0||!c.card)return false;
  if(id==='tea'&&(!Number.isInteger(c.interaction.lastCompletedPour)||c.interaction.lastCompletedPour<0||c.interaction.lastCompletedPour>4||!Number.isInteger(c.interaction.goodPours)||c.interaction.goodPours<0||c.interaction.goodPours>4))return false;
  if(s.cards.includes(id)!==(c.quiz.status==='complete')||(c.status==='complete'&&c.quiz.status!=='complete'))return false;
  if(c.quiz.status==='complete'&&(c.storyBeat!==3||c.interaction.status!=='complete'||!['answered','skipped'].includes(c.qa.status)||!meta.topics.includes(c.card.variantId)||typeof c.card.unlockedAt!=='string'))return false;
  return canVisit(s,id);
 });
}
/** Derive the tea checkpoint from progress. @param {Session} s @returns {string} */
export function deriveStep(s,id=s.currentChapter??'tea') { const t=s.chapters[id]; if(!t.qa)return t.card?'reveal':'intro'; if(t.status==='available')return 'intro';if(t.storyBeat<3)return 'story';if(t.interaction.status!=='complete')return 'interaction';if(['not_started','in_progress'].includes(t.qa.status))return 'qa';if(t.quiz.status!=='complete')return 'quiz';return 'reveal'; }
/** Apply one guarded transition without mutating prior state. @param {Session} previous @param {Action} action @returns {Session} */
export function transition(previous,action) {
  const s=structuredClone(previous),id=action.chapterId??s.currentChapter??'tea'; if(!CHAPTERS[id]||!canVisit(s,id))return s; if(['chapterIntro','startChapter'].includes(action.type)&&!s.chapters[id].qa&&!s.cards.includes(id))s.chapters[id]=createChapter(id); const t=s.chapters[id]; s.updatedAt=new Date().toISOString();
  switch(action.type) {
    case 'start': s.stage='order';break;
    case 'chapterIntro': s.stage='chapter';s.currentChapter=id;break;
    case 'startChapter':t.status=t.status==='complete'?'complete':'in_progress';s.stage='chapter';s.currentChapter=id;break;
    case 'beat': if(t.status!=='available')t.storyBeat=Math.min(3,t.storyBeat+1);break;
    case 'interaction': if(t.storyBeat===3 && t.interaction.status!=='complete')t.interaction=action.value;break;
    case 'answer': if(t.interaction.status==='complete' && t.qa.turns<2 && ['not_started','in_progress'].includes(t.qa.status) && CHAPTERS[id].topics.includes(action.topicTag)){t.qa.turns++;t.qa.topicTag=action.topicTag;t.qa.sourceIds=action.sourceIds;t.qa.status=t.qa.turns===2?'answered':'in_progress';}break;
    case 'finishQa': if(t.qa.turns>0)t.qa.status='answered';break;
    case 'skipQa': if(t.interaction.status==='complete'){t.qa.status='skipped';t.qa.topicTag=null;}break;
    case 'quiz':
      if(t.interaction.status!=='complete'||!['answered','skipped'].includes(t.qa.status)||t.quiz.status==='complete')break;
      t.quiz.attempts++;if(t.quiz.attempts===1)t.quiz.firstTryCorrect=!!action.correct;t.quiz.status='in_progress';
      if(action.correct){t.quiz.status='complete';t.card={variantId:t.qa.topicTag??CHAPTERS[id].topics[0],unlockedAt:s.updatedAt};if(!s.cards.includes(id))s.cards.push(id);}break;
    case 'collect':if(t.quiz?.status==='complete'||t.status==='complete'){t.status='complete';s.stage='order';s.currentChapter=null;const next=CHAPTER_IDS[CHAPTER_IDS.indexOf(id)+1];if(next&&s.chapters[next].status==='locked')s.chapters[next]=createChapter(next);}break;
    case 'devComplete': if(action.dev && s.cards.includes('tea')){for(const id of ['bun','tart']){s.chapters[id]={status:'complete',card:{variantId:'craft',unlockedAt:s.updatedAt}};if(!s.cards.includes(id))s.cards.push(id);}}break;
    case 'stage': s.stage=action.value;break;
    case 'generated':s.certificate.generatedAt=s.updatedAt;break;
    case 'downloaded':s.certificate.downloadedAt=s.updatedAt;break;
  }
  return s;
}
