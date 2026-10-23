import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, KEYS } from '../assets/js/storage.js';
import { createSession } from '../assets/js/state.js';

/** Make a minimal storage implementation for boundary tests. @returns {Storage} */
function memory() { const values=new Map(); return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}; }
test('corrupt persisted JSON yields fresh state while unrelated data is retained',()=>{
  const local=memory();local.setItem(KEYS.progress,'broken');local.setItem('other','keep');
  const store=createStorage(local,memory());
  assert.equal(store.load('phone').chapters.tea.status,'available');
  assert.equal(local.getItem('other'),'keep');
});
test('visitor reset clears visit data but staff reset also clears settings',()=>{
  const local=memory(),tab=memory(),store=createStorage(local,tab);
  store.write('settings',{captions:true});store.save(createSession('phone'));store.write('events',[{name:'test'}]);store.write('transcript',['sample']);
  store.reset(false);
  assert.deepEqual(store.read('settings'),{captions:true}); assert.equal(store.read('transcript'),null);assert.equal(store.read('events'),null);
  store.reset(true);assert.equal(store.read('settings'),null);
});
test('security errors fall back to memory and unexpected failures are surfaced',()=>{
  const denied={getItem(){throw new DOMException('Denied','SecurityError');},setItem(){throw new DOMException('Denied','SecurityError');},removeItem(){throw new DOMException('Denied','SecurityError');}};
  const store=createStorage(denied,denied);const s=createSession('phone');store.save(s);
  assert.equal(store.load('phone').sessionId,s.sessionId);assert.equal(store.persistent,false);
  assert.throws(()=>createStorage({getItem(){throw new Error('unexpected');}},memory()).load('phone'),/unexpected/);
});
