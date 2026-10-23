import {CONFIG,readMode} from './config.js';
import {createSession,transition,deriveStep} from './state.js';
import {createStorage} from './storage.js';
import {resolveRoute} from './router.js';
import {loadContent} from './content.js';
import {openDialog,setupDialog} from './dialog.js';
import {escapeHtml,entryView,orderView,introView,storyView,teaView,qaView,quizView,cardView} from './views.js';
import {mountTea} from './tea.js';
import {askGuide,GuideError,BANK,validateResponse} from './guide.js';
import {createTelemetry} from './telemetry.js';

const mode=readMode(location.search),store=createStorage(localStorage,sessionStorage);
let session=store.load(mode.mode),chapter,sources,viewedBeat=null,cleanupScreen=()=>{},qaBusy=false,showingAnswer=false,requestToken=0;
let telemetry=createTelemetry(store,session.sessionId);
const main=document.querySelector('main'),dialog=document.querySelector('#dialog');
setupDialog(dialog);
/** Commit a state transition immediately. @param {import('./state.js').Action} action @returns {void} */
function apply(action){session=transition(session,action);store.save(session);}
/** Record a safe event and expose a full-buffer note. @param {string} name @param {object} fields @param {string} [key] @returns {void} */
function record(name,fields,key){if(!telemetry.record(name,fields,key))document.querySelector('#banner').textContent='The local event log is full. Export it before the next staff reset.';}
/** Read only this visit's tab-local conversation. @returns {object[]} */
function turns(){const data=store.read('transcript');return data?.sessionId===session.sessionId&&Array.isArray(data.turns)?data.turns:[];}
/** Offer a local download and release its object URL. @param {Blob} blob @param {string} name @returns {void} */
function download(blob,name){const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
/** Ask a local sample and discard stale responses after leaving or resetting. @param {string} question @param {object|null} chip @returns {Promise<void>} */
async function submitQuestion(question,chip=null){
 if(qaBusy||session.chapters.tea.qa.turns>=2||!question.trim()||question.length>120)return;
 const token=++requestToken,visit=session.sessionId,turn=session.chapters.tea.qa.turns+1,start=performance.now();qaBusy=true;showingAnswer=true;
 record('qa_question_submit',{chapterId:'tea',source:chip?'chip':'free',latencyMs:0},`question-${turn}`);render();
 let response,fallback=false;
 try{response=validateResponse(await askGuide({sessionId:visit,chapterId:'tea',personaId:'tea_master',question,history:turns().flatMap(t=>[{role:'visitor',content:t.question},{role:'guide',content:t.answer}]),mode:mode.mode}));}
 catch(error){if(!(error instanceof GuideError))throw error;fallback=true;const sample=BANK[chip?chapter.qa.suggested.indexOf(chip):0];response={answer:sample.answer,sourceIds:sample.sourceIds,topicTag:sample.topicTag,safety:'ok',suggestedFollowUp:null};record('error',{code:'GUIDE_FALLBACK',chapterId:'tea',screen:'qa'});}
 if(token!==requestToken||visit!==session.sessionId||location.hash!=='#/tea')return;
 qaBusy=false;const topicTag=chip?.topicTag??response.topicTag;apply({type:'answer',topicTag,sourceIds:response.sourceIds});
 store.write('transcript',{sessionId:visit,turns:[...turns(),{question,answer:response.answer,fallback}]});
 record('qa_answer_render',{chapterId:'tea',topicTag,fallback,safety:response.safety,latencyMs:Math.round(performance.now()-start)},`answer-${turn}`);render();document.querySelector('#announcer').textContent=response.answer;
}
/** Navigate to a guarded route, including same-route refresh. @param {string} route @returns {void} */
function go(route){if(location.hash===route)render();else location.hash=route;}
/** Display information inside an accessible native dialog. @param {string} title @param {string} body @returns {void} */
function showDialog(title,body){document.querySelector('#dialog-content').innerHTML=`<h2 id="dialog-title">${escapeHtml(title)}</h2>${body}`;openDialog(dialog,document.activeElement);}
/** Render current route and move focus to its heading. @returns {void} */
function render(){
 if(!chapter)return;
 cleanupScreen();cleanupScreen=()=>{};
 const route=resolveRoute(location.hash||'#/',session);if(route!==(location.hash||'#/')){location.replace(route);return;}
 let html='';
 if(route==='#/')html=entryView();
 if(route==='#/order')html=orderView(session,mode.dev);
 if(route==='#/tea'){
   const step=deriveStep(session);
   if(step==='intro')html=introView();
   else if(step==='story')html=storyView(chapter,viewedBeat??session.chapters.tea.storyBeat);
   else if(step==='interaction')html=teaView(session.chapters.tea.interaction);
   else if(step==='qa'||showingAnswer){html=qaView(chapter,session.chapters.tea.qa,turns(),qaBusy);record('qa_open',{chapterId:'tea'},'qa-open');}
   else if(step==='quiz')html=quizView(chapter,session.chapters.tea.quiz);
   else html=cardView(chapter,session.chapters.tea);
 }
 main.innerHTML=html;main.dataset.ready='true';main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo(0,0);
 if(route==='#/tea'&&deriveStep(session)==='interaction'){record('interaction_start',{chapterId:'tea'},'interaction-start');cleanupScreen=mountTea(main,session.chapters.tea.interaction,(value,result)=>{apply({type:'interaction',value});if(result)record('interaction_attempt',{chapterId:'tea',attemptNumber:value.attempts,result},`pour-${value.attempts}-${value.lastCompletedPour}`);if(value.status==='complete')record('interaction_complete',{chapterId:'tea',attempts:value.attempts,steadyMode:value.usedSteadyMode},'interaction-complete');});}
 document.title=`${main.querySelector('h1')?.textContent??'Your visit'} · Time Machine`;
}
/** Handle declarative actions from the shell and screens. @param {MouseEvent} event @returns {void} */
function onClick(event){const button=event.target.closest('[data-action]');if(!button||button.disabled)return;const action=button.dataset.action;
 switch(action){
 case 'start':apply({type:'start'});record('session_start',{mode:mode.mode,appVersion:CONFIG.appVersion},'start');record('intro_complete',{elapsedMs:Date.now()-Date.parse(session.startedAt)},'intro-complete');go('#/order');break;
 case 'order':go('#/order');break;
 case 'tea':apply({type:'chapterIntro'});record('chapter_start',{chapterId:'tea'},'chapter-start');viewedBeat=null;go('#/tea');break;
 case 'begin-story':apply({type:'startChapter'});render();break;
 case 'continue-practice':render();break;
 case 'next-beat':{const index=viewedBeat??session.chapters.tea.storyBeat;if(index===session.chapters.tea.storyBeat){apply({type:'beat'});record('story_beat_complete',{chapterId:'tea',beatIndex:index,elapsedMs:Date.now()-Date.parse(session.startedAt)},`beat-${index}`);}viewedBeat=index<session.chapters.tea.storyBeat-1?index+1:null;render();break;}
 case 'question':void submitQuestion(chapter.qa.suggested[Number(button.dataset.index)].text,chapter.qa.suggested[Number(button.dataset.index)]);break;
 case 'skip-qa':requestToken++;qaBusy=false;showingAnswer=false;apply({type:'skipQa'});record('qa_skip',{chapterId:'tea'},'qa-skip');render();break;
 case 'finish-qa':showingAnswer=false;apply({type:'finishQa'});render();break;
 case 'quiz':case 'place-order':{const correct=action==='place-order'||Number(button.dataset.index)===chapter.quiz.correctIndex;apply({type:'quiz',correct});record('quiz_attempt',{chapterId:'tea',attemptNumber:session.chapters.tea.quiz.attempts,correct,firstTryCorrect:session.chapters.tea.quiz.firstTryCorrect},`quiz-${session.chapters.tea.quiz.attempts}`);if(session.cards.includes('tea'))record('card_unlock',{chapterId:'tea',variantId:session.chapters.tea.card.variantId},'card-tea');render();break;}
 case 'collect':apply({type:'collect'});record('chapter_complete',{chapterId:'tea',elapsedMs:Date.now()-Date.parse(session.startedAt)},'chapter-complete');go('#/order');break;
 case 'card-detail':{const card=chapter.cards.find(c=>c.variantId===session.chapters.tea.card.variantId);showDialog(card.title,`<p>${escapeHtml(card.caption)}</p><p>${escapeHtml(card.fact)}</p><button class="text-button" data-action="sources">Source: development placeholder — not a cultural source.</button>`);break;}
 case 'export':download(telemetry.export(),'time-machine-events.json');break;
 case 'toggle-offline':document.querySelector('#banner').innerHTML='<div class="notice" role="status"><span>The core journey still works. The live guide is offline.</span><button class="secondary" data-action="dismiss-banner">Dismiss</button></div>';break;
 case 'dismiss-banner':document.querySelector('#banner').replaceChildren();break;
 case 'previous-beat':{const index=viewedBeat??session.chapters.tea.storyBeat;if(index===0)go('#/order');else{viewedBeat=index-1;render();}break;}
 case 'how':showDialog('Your table is ready.', '<ol><li>Take your order card. Three tables are waiting.</li><li>At each table, hear the story, try the craft, and ask a question.</li><li>Collect three cards. Put them together. Make your certificate.</li></ol><p>About 15–20 minutes for the planned full journey. This M1 build contains the tea table. Text, keyboard controls and a no-timing steady mode are available.</p><p>AI guide (mock) — no live model in this build. Final answers will be grounded in curator sources.</p>');break;
 case 'sources':showDialog('Sources & credits',`<p>Development entries only. Cultural fact sheets, final artwork and narration are pending review.</p><ul>${sources.map(s=>`<li><b>${escapeHtml(s.id)} · ${escapeHtml(s.title)}</b><p>${escapeHtml(s.description)}</p></li>`).join('')}</ul><p>Illustrations: original CSS/SVG development drawings. Fonts: local Georgia and Trebuchet MS with local fallbacks; no font files redistributed. No audio assets in this build.</p><p>The guides are fictional composite characters.</p>`);break;
 case 'privacy':showDialog('Privacy & AI', '<p>Nothing is sent anywhere in M1. Questions receive local development samples; no live AI provider is connected.</p><p>Progress, settings and up to 2,000 anonymous events are stored on this device. Questions and answers remain in this tab’s session storage until the tab closes or your visit is cleared. Your optional certificate name stays in memory and the downloaded image only.</p><p>A later live build will send typed questions to an AI service and will disclose its provider and retention terms before activation.</p><button data-action="reset">Clear my data</button>');break;
 case 'help':showDialog('Make yourself comfortable',`<p>Use Tab, Enter and Space to move through the experience. Story text and captions are always available. Choose steady mode during the practice for four taps without timing.</p><p>Narration not in this build.</p><p>${store.persistent?'Progress is saved on this device.':'Storage is unavailable. This visit works in memory; reloading will lose progress.'}</p><button class="secondary" data-action="reset">Start a new visit</button>${mode.dev?'<div class="dev-tools"><button class="secondary" data-action="export">Export local events</button><button class="secondary" data-action="toggle-offline">Show offline sample</button></div>':''}`);break;
 case 'reset':showDialog('Start a new visit?', '<p>Start a new visit? This clears progress, cards and questions on this device.</p><button data-action="confirm-reset">Start a new visit</button>');break;
 case 'confirm-reset':requestToken++;qaBusy=false;showingAnswer=false;record('session_reset',{trigger:'visitor'});store.reset(false);session=createSession(mode.mode);telemetry=createTelemetry(store,session.sessionId);viewedBeat=null;dialog.close();go('#/');break;
 case 'close-dialog':dialog.close();break;
 }
}
document.addEventListener('click',onClick);
document.addEventListener('submit',event=>{if(event.target.id==='question-form'){event.preventDefault();void submitQuestion(document.querySelector('#question').value);}});
window.addEventListener('hashchange',()=>{requestToken++;qaBusy=false;showingAnswer=false;viewedBeat=null;render();});
const loaded=await loadContent();chapter=loaded.chapter;sources=loaded.sources;render();
