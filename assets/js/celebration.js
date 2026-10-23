import {CHAPTER_IDS,canVisit} from './chapters.js';
let celebratedVisit=null;
/** Apply a shared unlocked treatment, with one brief non-interactive burst per visit. @param {import('./state.js').Session} session @returns {void} */
export function updateCelebration(session){
 const unlocked=CHAPTER_IDS.every(id=>canVisit(session,id));
 document.body.classList.toggle('all-unlocked',unlocked);
 if(!unlocked){document.querySelector('.unlock-confetti')?.remove();celebratedVisit=null;return;}
 if(celebratedVisit===session.sessionId)return;
 celebratedVisit=session.sessionId;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=document.createElement('div');layer.className='unlock-confetti';layer.setAttribute('aria-hidden','true');
 for(let i=0;i<24;i++){const piece=document.createElement('i');piece.style.setProperty('--x',`${(i*41)%100}%`);piece.style.setProperty('--delay',`${(i%6)*.12}s`);piece.style.setProperty('--turn',`${i%2?420:-380}deg`);layer.append(piece);}
 document.body.append(layer);setTimeout(()=>layer.remove(),4000);
}
