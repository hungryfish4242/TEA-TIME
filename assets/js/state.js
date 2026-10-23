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
/** Validate persisted session structure before using it. @param {unknown} value @returns {boolean} */
export function validSession(value) {
  const s=/** @type {Session} */(value),t=s?.chapters?.tea;
  return !!(s && s.schemaVersion===1 && typeof s.sessionId==='string' && ['phone','kiosk'].includes(s.mode) && ['entry','order','chapter','scene','certificate'].includes(s.stage) &&
    t && ['available','in_progress','complete'].includes(t.status) && Number.isInteger(t.storyBeat) && t.storyBeat>=0 && t.storyBeat<=3 &&
    t.qa && ['not_started','in_progress','answered','skipped'].includes(t.qa.status) && Number.isInteger(t.qa.turns) && t.qa.turns>=0 && t.qa.turns<=2 && Array.isArray(t.qa.sourceIds) && (t.qa.topicTag===null||['craft','ratio','origin'].includes(t.qa.topicTag)) &&
    t.interaction && ['not_started','in_progress','retry','complete'].includes(t.interaction.status) && Number.isInteger(t.interaction.attempts) && t.interaction.attempts>=0 && t.interaction.attempts<=2 && Number.isInteger(t.interaction.lastCompletedPour) && t.interaction.lastCompletedPour>=0 && t.interaction.lastCompletedPour<=4 && Number.isInteger(t.interaction.goodPours) && t.interaction.goodPours>=0 && t.interaction.goodPours<=4 &&
    t.quiz && ['not_started','in_progress','complete'].includes(t.quiz.status) && Number.isInteger(t.quiz.attempts) && t.quiz.attempts>=0 && t.card &&
    s.chapters.bun && s.chapters.tart && Array.isArray(s.cards) && new Set(s.cards).size===s.cards.length && s.cards.every(c=>['tea','bun','tart'].includes(c)) && s.certificate &&
    Number.isFinite(Date.parse(s.startedAt)) && Number.isFinite(Date.parse(s.updatedAt)) && t.qa.sourceIds.every(id=>typeof id==='string') &&
    (s.cards.includes('tea') === (t.quiz.status==='complete')) &&
    (t.status!=='complete'||t.quiz.status==='complete') &&
    (!s.cards.includes('tea') || (t.interaction.status==='complete' && t.storyBeat===3 && ['answered','skipped'].includes(t.qa.status) && typeof t.card.unlockedAt==='string' && ['craft','ratio','origin'].includes(t.card.variantId))) &&
    ['bun','tart'].every(id=>!s.cards.includes(id)||(s.cards.includes('tea')&&s.chapters[id].status==='complete')));
}
/** Derive the tea checkpoint from progress. @param {Session} s @returns {string} */
export function deriveStep(s) { const t=s.chapters.tea; if(t.status==='available')return 'intro';if(t.storyBeat<3)return 'story';if(t.interaction.status!=='complete')return 'interaction';if(['not_started','in_progress'].includes(t.qa.status))return 'qa';if(t.quiz.status!=='complete')return 'quiz';return 'reveal'; }
/** Apply one guarded transition without mutating prior state. @param {Session} previous @param {Action} action @returns {Session} */
export function transition(previous,action) {
  const s=structuredClone(previous),t=s.chapters.tea; s.updatedAt=new Date().toISOString();
  switch(action.type) {
    case 'start': s.stage='order';break;
    case 'chapterIntro': s.stage='chapter';s.currentChapter='tea';break;
    case 'startChapter':t.status=t.status==='complete'?'complete':'in_progress';s.stage='chapter';s.currentChapter='tea';break;
    case 'beat': if(t.status!=='available')t.storyBeat=Math.min(3,t.storyBeat+1);break;
    case 'interaction': if(t.storyBeat===3 && t.interaction.status!=='complete')t.interaction=action.value;break;
    case 'answer': if(t.interaction.status==='complete' && t.qa.turns<2 && ['not_started','in_progress'].includes(t.qa.status) && ['craft','ratio','origin'].includes(action.topicTag)){t.qa.turns++;t.qa.topicTag=action.topicTag;t.qa.sourceIds=action.sourceIds;t.qa.status=t.qa.turns===2?'answered':'in_progress';}break;
    case 'finishQa': if(t.qa.turns>0)t.qa.status='answered';break;
    case 'skipQa': if(t.interaction.status==='complete'){t.qa.status='skipped';t.qa.topicTag=null;}break;
    case 'quiz':
      if(t.interaction.status!=='complete'||!['answered','skipped'].includes(t.qa.status)||t.quiz.status==='complete')break;
      t.quiz.attempts++;if(t.quiz.attempts===1)t.quiz.firstTryCorrect=!!action.correct;t.quiz.status='in_progress';
      if(action.correct){t.quiz.status='complete';t.card={variantId:t.qa.topicTag??'craft',unlockedAt:s.updatedAt};if(!s.cards.includes('tea'))s.cards.push('tea');}break;
    case 'collect':if(t.quiz.status==='complete'){t.status='complete';s.stage='order';s.currentChapter=null;}break;
    case 'devComplete': if(action.dev && s.cards.includes('tea')){for(const id of ['bun','tart']){s.chapters[id]={status:'complete',card:{variantId:'craft',unlockedAt:s.updatedAt}};if(!s.cards.includes(id))s.cards.push(id);}}break;
    case 'stage': s.stage=action.value;break;
    case 'generated':s.certificate.generatedAt=s.updatedAt;break;
    case 'downloaded':s.certificate.downloadedAt=s.updatedAt;break;
  }
  return s;
}
