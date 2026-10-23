import {foodArt,progress} from './views.js';
import {CHAPTERS} from './chapters.js';
/** Create transient activity state; incomplete activities resume at their safe start. @param {string} id @returns {object} */
export function initialActivity(id){return {id,step:0,attempts:0,inspected:[],complete:false,feedback:id==='bun'?'Start by splitting the warm bun.':'Look at either sample, or choose directly. Hint: look for layers.'};}
/** Apply one explicit selection without ever awarding a card. @param {object} previous @param {string} action @returns {object} */
export function advanceActivity(previous,action){
 const s=structuredClone(previous);if(s.complete)return s;
 if(s.id==='bun'){
  if(s.step===0&&action==='split'){s.step=1;s.feedback='Now choose what goes inside this practice bun.';}
  else if(s.step===1&&action==='butter'){s.step=2;s.feedback='Cross-section: a pale butter slab sits between the two bun halves. Close the bun to finish.';}
  else if(s.step===2&&action==='close'){s.step=3;s.complete=true;s.feedback='Practice complete. Your bun is assembled.';}
  else{s.feedback=s.step===1?'For this practice recipe, choose cold butter. Try another ingredient.':'Follow the highlighted step first.';}
 }else if(action.startsWith('inspect-')){const sample=action.slice(8);if(!s.inspected.includes(sample))s.inspected.push(sample);s.feedback=sample==='puff'?'Puff-pastry sample: layered and flaky. The cut section shows fine stacked layers.':'Shortcrust sample: crumbly and cookie-like. The described section has an even, compact texture.';}
 else if(action==='puff'){s.complete=true;s.feedback='Practice complete. Puff pastry is the layered sample; shortcrust is the crumbly sample. Neither is ranked better.';}
 else{s.feedback='Look for the layered sample. Inspect either description or choose again.';}
 s.attempts++;return s;
}
/** Render either remaining practice using the shared visual language. @param {string} id @returns {string} */
export function activityView(id){return `${progress(1)}<section class="chapter-layout"><div class="chapter-art">${foodArt(id)}<span class="art-note">GENERATED STUDY · DEVELOPMENT PRACTICE</span></div><div class="chapter-copy"><p class="eyebrow">TABLE ${CHAPTERS[id].number} · ${CHAPTERS[id].idea}</p><h1 tabindex="-1">${id==='bun'?'Build your<br><em>little ritual.</em>':'Look a little<br><em>closer.</em>'}</h1><p>${id==='bun'?'Split, choose, close. Three deliberate steps.':'Compare two labelled pastry samples. Inspection is optional.'}</p><div id="activity-controls"></div><p id="activity-feedback" role="status"></p><p class="small">A prototype activity, not a historical reconstruction. Your card follows the order check.</p></div></section>`;}
/** Mount button-driven practice with keyboard focus and a cancellable hint timer. @param {HTMLElement} root @param {string} id @param {(value:object,result:string)=>void} save @returns {()=>void} */
export function mountActivity(root,id,save){
 let state=initialActivity(id);const controls=root.querySelector('#activity-controls'),feedback=root.querySelector('#activity-feedback');
 /** Present only actions relevant to the current safe step. @param {boolean} [focus] @returns {void} */
 function update(focus=false){
  feedback.textContent=state.feedback;
  if(state.complete)controls.innerHTML='<button data-action="continue-practice">Continue →</button>';
  else if(id==='bun')controls.innerHTML=state.step===0?'<button data-choice="split">Split the warm bun</button>':state.step===1?'<div class="ingredient-grid"><button class="secondary" data-choice="pineapple">Pineapple ring</button><button data-choice="butter">Cold butter</button><button class="secondary" data-choice="crust">Sugar-crust piece</button><button class="secondary" data-choice="egg">Egg</button></div>':'<button data-choice="close">Place and close</button>';
  else controls.innerHTML='<div class="tart-options"><article><h2>Sample A</h2><p>Shortcrust · crumbly and cookie-like</p><button class="secondary" data-choice="inspect-shortcrust">Inspect shortcrust</button><button class="secondary" data-choice="shortcrust">Choose shortcrust</button></article><article><h2>Sample B</h2><p>Puff pastry · layered and flaky</p><button class="secondary" data-choice="inspect-puff">Inspect puff pastry</button><button data-choice="puff">Choose puff pastry</button></article></div>';
  if(focus)controls.querySelector('button')?.focus();
 }
 /** Persist only the published interaction result fields. @param {MouseEvent} event @returns {void} */
 function select(event){const button=event.target.closest('[data-choice]');if(!button)return;state=advanceActivity(state,button.dataset.choice);save({status:state.complete?'complete':'in_progress',attempts:state.attempts,usedSteadyMode:false},button.dataset.choice);update(true);}
 controls.addEventListener('click',select);update();
 const hint=setTimeout(()=>{if(id==='bun'&&state.step===0)feedback.textContent='Start with the warm bun.';},12000);
 return ()=>{clearTimeout(hint);controls.removeEventListener('click',select);};
}
