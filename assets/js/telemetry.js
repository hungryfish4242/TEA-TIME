import {CONFIG} from './config.js';
const FIELDS=['mode','appVersion','elapsedMs','chapterId','beatIndex','source','latencyMs','topicTag','fallback','safety','attemptNumber','result','attempts','steadyMode','correct','firstTryCorrect','variantId','success','method','trigger','code','screen'];
/** Create a local event recorder with field allowlisting and duplicate protection. @param {import('./storage.js').StorageAdapter} store @param {string} sessionId @returns {{record:(name:string,fields:object,key?:string)=>boolean,export:()=>Blob}} */
export function createTelemetry(store,sessionId){
 /** Reject malformed stored records at the persistence boundary. @returns {object[]} */
 function readEvents(){const saved=store.read('events');if(!Array.isArray(saved))return [];return saved.filter(e=>e&&typeof e==='object'&&typeof e.name==='string'&&typeof e.sessionId==='string'&&Number.isFinite(e.timestamp)&&e.fields&&typeof e.fields==='object'&&!Array.isArray(e.fields)).map(e=>({...e,fields:Object.fromEntries(Object.entries(e.fields).filter(([field])=>FIELDS.includes(field)))}));}
 return {
  /** Append a real transition, not a re-render. @param {string} name @param {object} fields @param {string} [key] @returns {boolean} */
  record(name,fields,key){const events=readEvents();if(key&&events.some(e=>e.sessionId===sessionId&&e.key===key))return true;if(events.length>=2000)return false;const safe=Object.fromEntries(Object.entries(fields).filter(([field])=>FIELDS.includes(field)));events.push({name,sessionId,timestamp:Date.now(),...(key?{key}:{}),fields:safe});store.write('events',events);return true;},
  /** Produce only anonymous events and a versioned manifest. @returns {Blob} */
  export(){const events=readEvents();return new Blob([JSON.stringify({manifest:{appVersion:CONFIG.appVersion,contentVersion:CONFIG.contentVersion,exportedAt:new Date().toISOString(),eventCount:events.length},events},null,2)],{type:'application/json'});}
 };
}
