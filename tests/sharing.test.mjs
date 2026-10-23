import test from 'node:test';
import assert from 'node:assert/strict';
import {shareCertificate} from '../assets/js/sharing.js';
test('unsupported file sharing requests a download fallback',async()=>{assert.equal(await shareCertificate(new Blob(['image'],{type:'image/png'}),{}),'download');});
test('native file sharing uses a PNG and cancellation does not trigger a download',async()=>{
 let file;
 const navigator={canShare:()=>true,share:async data=>{file=data.files[0];}};
 assert.equal(await shareCertificate(new Blob(['image'],{type:'image/png'}),navigator),'shared');assert.equal(file.type,'image/png');
 navigator.share=async()=>{throw new DOMException('Canceled','AbortError');};assert.equal(await shareCertificate(new Blob(),navigator),'cancelled');
});
