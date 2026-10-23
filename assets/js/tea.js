import {CONFIG} from './config.js';
/** Classify elapsed time from a beat. @param {number} deltaMs @param {number} goodWindowMs @returns {string} */
export function classifyPour(deltaMs,goodWindowMs){const error=Math.abs(deltaMs);return error<=120?'perfect':error<=goodWindowMs?'good':'miss';}
/** Start or resume a practice round. @param {import('./state.js').TeaInteraction} state @param {boolean} steady @returns {import('./state.js').TeaInteraction} */
export function startRound(state,steady){if(state.status==='complete')return state;const next={...state,usedSteadyMode:steady,status:'in_progress'};if(['not_started','retry'].includes(state.status)){next.attempts++;next.lastCompletedPour=0;next.goodPours=0;}return next;}
/** Record exactly one outcome per consecutive beat. @param {import('./state.js').TeaInteraction} state @param {number} beatIndex @param {string} result @returns {import('./state.js').TeaInteraction} */
export function recordPour(state,beatIndex,result){
 if(state.status!=='in_progress'||beatIndex!==state.lastCompletedPour||beatIndex>=4)return state;
 const next={...state,lastCompletedPour:beatIndex+1,goodPours:state.goodPours+(['good','perfect'].includes(result)?1:0)};
 if(next.lastCompletedPour===4)next.status=next.usedSteadyMode||next.goodPours>=3||next.attempts>=2?'complete':'retry';
 return next;
}
/** Attach an elapsed-time interaction controller to one screen. @param {HTMLElement} root @param {import('./state.js').TeaInteraction} initial @param {(state:import('./state.js').TeaInteraction,result:string|null)=>void} save @returns {()=>void} */
export function mountTea(root,initial,save){
 let state={...initial},frame=0,running=false,target=0,resolved=false,lastTap=-Infinity,beat=state.lastCompletedPour;
 const period=60000/CONFIG.bpm,pour=root.querySelector('#pour'),feedback=root.querySelector('#pour-feedback'),count=root.querySelector('#pour-count'),marker=root.querySelector('#rhythm-marker'),begin=root.querySelector('#begin-round'),steady=root.querySelector('#steady-round');
 /** Reflect progress without re-rendering focusable controls. @returns {void} */
 function update(){count.textContent=`${state.lastCompletedPour} of 4 pours`;root.querySelectorAll('.pour-dot').forEach((dot,i)=>dot.classList.toggle('filled',i<state.lastCompletedPour));if(state.status==='complete'){running=false;pour.disabled=true;begin.hidden=true;steady.hidden=true;feedback.textContent='Practice complete. Your next question is ready.';root.querySelector('#practice-continue').hidden=false;}else if(state.status==='retry'){running=false;pour.disabled=true;begin.hidden=false;begin.textContent='Try once more';steady.hidden=false;feedback.textContent='One more round, with a wider window. Or choose steady mode.';}}
 /** Resolve the active beat and persist a checkpoint. @param {string} result @returns {void} */
 function resolve(result){if(resolved||!running)return;resolved=true;state=recordPour(state,beat,result);save(state,result);feedback.textContent={perfect:'Perfect pour',good:'Good pour',miss:'Not quite — watch the marker.',steady:'Pour recorded. Take your time.'}[result];update();}
 /** Advance the marker using monotonic elapsed time. @param {number} now @returns {void} */
 function tick(now){if(!running||state.usedSteadyMode)return;const delta=now-target;marker.style.left=`${Math.max(0,Math.min(100,50+delta/period*100))}%`;if(delta>=period/2){if(!resolved)feedback.textContent='Tap Pour when you are ready. An empty beat does not count.';if(running){target=now+period/2;beat=state.lastCompletedPour;resolved=false;}}frame=requestAnimationFrame(tick);}
 /** Begin with an explicit user gesture. @param {boolean} useSteady @returns {void} */
 function start(useSteady){useSteady=useSteady||matchMedia('(prefers-reduced-motion: reduce)').matches;cancelAnimationFrame(frame);state=startRound(state,useSteady);save(state,null);running=true;resolved=false;beat=state.lastCompletedPour;target=performance.now()+period;lastTap=-Infinity;pour.disabled=false;begin.hidden=true;steady.hidden=true;root.querySelector('.rhythm').hidden=useSteady;feedback.textContent=useSteady?'Four taps at your own pace.':'Pour when the marker reaches the middle band.';pour.focus();update();if(!useSteady)frame=requestAnimationFrame(tick);}
 /** Handle one press while filtering rapid double activation. @returns {void} */
 function tap(){const now=performance.now();if(!running||now-lastTap<250)return;lastTap=now;if(state.usedSteadyMode){resolved=false;beat=state.lastCompletedPour;resolve('steady');}else resolve(classifyPour(now-target,state.attempts>1?CONFIG.retryGoodMs:CONFIG.goodMs));}
 begin.addEventListener('click',()=>start(state.usedSteadyMode));steady.addEventListener('click',()=>start(true));pour.addEventListener('click',tap);update();
 return ()=>{running=false;cancelAnimationFrame(frame);};
}
