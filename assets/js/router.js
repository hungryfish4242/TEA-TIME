import {CHAPTER_IDS,canVisit} from './chapters.js';
/** Guard hash routes against incomplete chapters. @param {string} hash @param {import('./state.js').Session} session @returns {string} */
export function resolveRoute(hash,session) {
  const id=hash.slice(2);if(CHAPTER_IDS.includes(id)&&!canVisit(session,id))return '#/order';
  if(['#/scene','#/certificate'].includes(hash)&&session.cards.length!==3)return '#/order';
  return ['#/','#/order','#/tea','#/bun','#/tart','#/scene','#/certificate'].includes(hash)?hash:'#/';
}
