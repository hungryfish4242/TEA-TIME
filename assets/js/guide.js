import {CONFIG} from './config.js';
/** Expected guide boundary failure, handled by the local fallback UI. */
export class GuideError extends Error {}
/** @typedef {{sessionId:string,chapterId:string,personaId:string,question:string,history:{role:string,content:string}[],mode:string}} GuideRequest */
/** @typedef {{answer:string,sourceIds:string[],topicTag:string,safety:string,suggestedFollowUp:string|null}} GuideResponse */
export const BANK=[
 {question:'What does steady mode do?',answer:'Steady mode lets you complete the practice with four taps at your own pace. There is no moving marker, timing score or failed round. This is a development sample about the interface, not a cultural claim.',sourceIds:['DEV-QA-01'],topicTag:'craft'},
 {question:'Can I skip a question?',answer:'Yes. Choose Skip for now to continue to the order check. Skipping chooses the default development card. You can ask up to two questions at this table; neither is required to continue.',sourceIds:['DEV-QA-02'],topicTag:'ratio'},
 {question:'Where are the sources?',answer:'Open Sources & credits from the footer or the source line below this answer. The current entries describe development controls and placeholders. Reviewed cultural sources will replace them before a public version is considered.',sourceIds:['DEV-QA-03'],topicTag:'origin'}
];
/** Validate an answer before rendering it as plain text. @param {unknown} value @returns {GuideResponse} */
export function validateResponse(value){const r=/** @type {GuideResponse} */(value);if(!r||typeof r.answer!=='string'||!r.answer.trim()||r.answer.trim().split(/\s+/).length>90||!Array.isArray(r.sourceIds)||!r.sourceIds.length||!r.sourceIds.every(id=>BANK.some(b=>b.sourceIds.includes(id)))||!['craft','ratio','origin'].includes(r.topicTag)||!['ok','redirect','refuse'].includes(r.safety)||!(r.suggestedFollowUp===null||typeof r.suggestedFollowUp==='string'))throw new GuideError('Invalid mock guide response');return r;}
/** Return a sample under the exact production replacement contract. @param {GuideRequest} request @returns {Promise<GuideResponse>} */
export async function askGuide(request){
 if(CONFIG.production)throw new GuideError('Mock guide cannot start in production');
 if(!request||request.chapterId!=='tea'||request.personaId!=='tea_master'||typeof request.question!=='string'||!request.question.trim()||request.question.length>120||!Array.isArray(request.history)||!['phone','kiosk'].includes(request.mode))throw new GuideError('Invalid guide request');
 const fail=new URLSearchParams(globalThis.location?.search??'').get('mock')==='fail';
 await new Promise(resolve=>setTimeout(resolve,fail?CONFIG.timeoutMs:400));
 if(fail)throw new GuideError('Mock timeout after 8000 ms');
 const sample=BANK.find(b=>b.question===request.question)??BANK[0];
 return validateResponse({answer:sample.answer,sourceIds:sample.sourceIds,topicTag:sample.topicTag,safety:'ok',suggestedFollowUp:null});
}
