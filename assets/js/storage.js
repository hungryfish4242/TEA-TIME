import {createSession,validSession} from './state.js';
export const KEYS={progress:'ccttm.progress.v1',transcript:'ccttm.transcript.v1',events:'ccttm.events.v1',settings:'ccttm.settings.v1'};
/** @typedef {{read:(name:string)=>any,write:(name:string,value:any)=>void,save:(session:import('./state.js').Session)=>void,load:(mode:string)=>import('./state.js').Session,reset:(staff:boolean)=>void,persistent:boolean}} StorageAdapter */
/** Access storage with narrowly handled browser denial/quota failures. @param {Storage} local @param {Storage} tab @returns {StorageAdapter} */
export function createStorage(local,tab) {
  const memory=new Map();let persistent=true;
  /** Execute a storage operation, falling back only for known failures. @param {string} name @param {string} op @param {string|null} value @returns {string|null} */
  function access(name,op,value=null) {
    const key=KEYS[name],storage=name==='transcript'?tab:local;
    if(op==='setItem')memory.set(key,value);if(op==='removeItem')memory.delete(key);
    if(!persistent)return memory.get(key)??null;
    try {if(op==='getItem'){const raw=storage.getItem(key);if(raw!==null)memory.set(key,raw);return raw;}storage[op](key,value);return null;}
    catch(error){if(!['SecurityError','QuotaExceededError'].includes(error.name))throw error;persistent=false;return memory.get(key)??null;}
  }
  /** Read validated JSON syntax; invalid user storage is a fresh value. @param {string} name @returns {any} */
  function read(name){const raw=access(name,'getItem');if(raw===null)return null;try{return JSON.parse(raw);}catch(error){if(!(error instanceof SyntaxError))throw error;return null;}}
  return {read,write(name,value){access(name,'setItem',JSON.stringify(value));},save(session){access('progress','setItem',JSON.stringify(session));},load(mode){const saved=read('progress');if(!validSession(saved))return createSession(mode);saved.mode=mode;return saved;},reset(staff){for(const key of ['progress','transcript','events',...(staff?['settings']:[])])access(key,'removeItem');},get persistent(){return persistent;}};
}
