import {CONFIG,readMode} from './config.js';
import {createSession,transition,deriveStep} from './state.js';
import {createStorage} from './storage.js';
import {resolveRoute} from './router.js';
import {loadContent} from './content.js';
import {openDialog,setupDialog} from './dialog.js';
import {escapeHtml,entryView,orderView,introView,storyView} from './views.js';

const mode=readMode(location.search),store=createStorage(localStorage,sessionStorage);
let session=store.load(mode.mode),chapter,sources,viewedBeat=null;
const main=document.querySelector('main'),dialog=document.querySelector('#dialog');
setupDialog(dialog);
/** Commit a state transition immediately. @param {import('./state.js').Action} action @returns {void} */
function apply(action){session=transition(session,action);store.save(session);}
/** Navigate to a guarded route, including same-route refresh. @param {string} route @returns {void} */
function go(route){if(location.hash===route)render();else location.hash=route;}
/** Display information inside an accessible native dialog. @param {string} title @param {string} body @returns {void} */
function showDialog(title,body){document.querySelector('#dialog-content').innerHTML=`<h2 id="dialog-title">${escapeHtml(title)}</h2>${body}`;openDialog(dialog,document.activeElement);}
/** Render current route and move focus to its heading. @returns {void} */
function render(){
 if(!chapter)return;
 const route=resolveRoute(location.hash||'#/',session);if(route!==(location.hash||'#/')){location.replace(route);return;}
 let html='';
 if(route==='#/')html=entryView();
 if(route==='#/order')html=orderView(session,mode.dev);
 if(route==='#/tea'){
   const step=deriveStep(session);
   if(step==='intro')html=introView();
   else if(step==='story')html=storyView(chapter,viewedBeat??session.chapters.tea.storyBeat);
   else html='<section class="centered"><h1 tabindex="-1">The practice table</h1><p>The next development step is being prepared.</p><button data-action="order">Back to my order card</button></section>';
 }
 main.innerHTML=html;main.dataset.ready='true';main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo(0,0);
 document.title=`${main.querySelector('h1')?.textContent??'Your visit'} · Time Machine`;
}
/** Handle declarative actions from the shell and screens. @param {MouseEvent} event @returns {void} */
function onClick(event){const button=event.target.closest('[data-action]');if(!button||button.disabled)return;const action=button.dataset.action;
 switch(action){
 case 'start':apply({type:'start'});go('#/order');break;
 case 'order':go('#/order');break;
 case 'tea':apply({type:'chapterIntro'});viewedBeat=null;go('#/tea');break;
 case 'begin-story':apply({type:'startChapter'});render();break;
 case 'next-beat':{const index=viewedBeat??session.chapters.tea.storyBeat;if(index===session.chapters.tea.storyBeat)apply({type:'beat'});viewedBeat=index<session.chapters.tea.storyBeat-1?index+1:null;render();break;}
 case 'previous-beat':{const index=viewedBeat??session.chapters.tea.storyBeat;if(index===0)go('#/order');else{viewedBeat=index-1;render();}break;}
 case 'how':showDialog('Your table is ready.', '<ol><li>Take your order card. Three tables are waiting.</li><li>At each table, hear the story, try the craft, and ask a question.</li><li>Collect three cards. Put them together. Make your certificate.</li></ol><p>About 15–20 minutes for the planned full journey. This M1 build contains the tea table. Text, keyboard controls and a no-timing steady mode are available.</p><p>AI guide (mock) — no live model in this build. Final answers will be grounded in curator sources.</p>');break;
 case 'sources':showDialog('Sources & credits',`<p>Development entries only. Cultural fact sheets, final artwork and narration are pending review.</p><ul>${sources.map(s=>`<li><b>${escapeHtml(s.id)} · ${escapeHtml(s.title)}</b><p>${escapeHtml(s.description)}</p></li>`).join('')}</ul><p>Illustrations: original CSS/SVG development drawings. Fonts: local Georgia and Trebuchet MS with local fallbacks; no font files redistributed. No audio assets in this build.</p><p>The guides are fictional composite characters.</p>`);break;
 case 'privacy':showDialog('Privacy & AI', '<p>Nothing is sent anywhere in M1. Questions receive local development samples; no live AI provider is connected.</p><p>Progress, settings and up to 2,000 anonymous events are stored on this device. Questions and answers remain in this tab’s session storage until the tab closes or your visit is cleared. Your optional certificate name stays in memory and the downloaded image only.</p><p>A later live build will send typed questions to an AI service and will disclose its provider and retention terms before activation.</p><button data-action="reset">Clear my data</button>');break;
 case 'help':showDialog('Make yourself comfortable',`<p>Use Tab, Enter and Space to move through the experience. Story text and captions are always available. Choose steady mode during the practice for four taps without timing.</p><p>Narration not in this build.</p><p>${store.persistent?'Progress is saved on this device.':'Storage is unavailable. This visit works in memory; reloading will lose progress.'}</p><button class="secondary" data-action="reset">Start a new visit</button>`);break;
 case 'reset':showDialog('Start a new visit?', '<p>Start a new visit? This clears progress, cards and questions on this device.</p><button data-action="confirm-reset">Start a new visit</button>');break;
 case 'confirm-reset':store.reset(false);session=createSession(mode.mode);viewedBeat=null;dialog.close();go('#/');break;
 case 'close-dialog':dialog.close();break;
 }
}
document.addEventListener('click',onClick);
window.addEventListener('hashchange',()=>{viewedBeat=null;render();});
const loaded=await loadContent();chapter=loaded.chapter;sources=loaded.sources;render();
