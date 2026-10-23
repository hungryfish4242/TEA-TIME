import {CONFIG} from './config.js';
/** @typedef {{id:string,title:string,devOnly:boolean,description:string}} Source */
/** @typedef {{id:string,devOnly:boolean,guideId:string,title:string,oneIdea:string,beats:object[],interaction:object,qa:object,quiz:object,cards:object[],defaultCardVariant:string}} Chapter */
/** Validate a chapter at the content boundary. @param {unknown} value @param {Source[]} sources @param {boolean} production @returns {Chapter} */
export function validateChapter(value,sources,production) {
  const c=/** @type {Chapter} */(value);
  /** Fail with a usable content diagnostic. @param {boolean} condition @param {string} message @returns {void} */
  function require(condition,message){if(!condition)throw new Error(`Content invalid: ${message}`);}
  require(!!c && c.id==='tea' && c.guideId==='tea_master','chapter or guide');
  require(typeof c.title==='string' && typeof c.oneIdea==='string','title and oneIdea');
  require(Array.isArray(c.beats)&&c.beats.length===3,'three beats required');
  require(Array.isArray(c.cards)&&c.cards.length===3 && new Set(c.cards.map(v=>v.variantId)).size===3,'three unique card variants required');
  require(c.cards.some(v=>v.variantId===c.defaultCardVariant),'default variant missing');
  const ids=new Set(sources.map(s=>s.id)),tags=['craft','ratio','origin'];
  require(c.qa?.maxTurns===2 && c.qa.suggested?.length===3,'QA shape');
  require(c.interaction?.type==='tea_pour' && c.interaction.pours===4,'interaction shape');
  require(c.quiz?.options?.length===3 && Number.isInteger(c.quiz.correctIndex)&&c.quiz.correctIndex>=0&&c.quiz.correctIndex<3,'quiz index');
  require(ids.has(c.quiz.sourceId),'quiz source missing');
  for(const q of c.qa.suggested)require(tags.includes(q.topicTag)&&ids.has(q.fallbackSourceId)&&typeof q.text==='string','question topic/source');
  for(const card of c.cards)require(tags.includes(card.variantId)&&ids.has(card.sourceId)&&typeof card.fact==='string'&&typeof card.title==='string'&&typeof card.caption==='string','card source/variant/fields');
  for(const beat of c.beats){require(typeof beat.text==='string'&&typeof beat.caption==='string'&&typeof beat.transcript==='string'&&Array.isArray(beat.sourceIds),'beat fields');require(beat.sourceIds.every(id=>ids.has(id)),'unresolved beat source');}
  if(production){
    const serialized=JSON.stringify(c);
    require(c.devOnly===false&&!serialized.includes('DEV-')&&!serialized.includes('[PLACEHOLDER]')&&!serialized.toLowerCase().includes('development placeholder'),'development content cannot ship');
    require(c.beats.every(b=>b.sourceIds.length>0),'factual beat missing source');
    require(sources.every(s=>!s.devOnly&&!s.id.startsWith('DEV-')),'development sources cannot ship');
  }else require(c.devOnly===true,'development files must be marked');
  return c;
}
/** Load local assets once so the core journey survives disconnection. @returns {Promise<{chapter:Chapter,sources:Source[]}>} */
export async function loadContent(){
  const paths=['content/chapters/tea.dev.json','content/sources.json'];
  const data=await Promise.all(paths.map(async path=>{const response=await fetch(path);if(!response.ok)throw new Error(`Content load failed: ${path}: ${response.status}`);return response.json();}));
  return {chapter:validateChapter(data[0],data[1],CONFIG.production),sources:data[1]};
}
