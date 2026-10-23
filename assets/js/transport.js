/** Detect only the non-secret mode injected by the local server. @returns {boolean} */
export function guideIsLive(){return globalThis.document?.querySelector('meta[name="guide-mode"]')?.content==='live'&&!new URLSearchParams(globalThis.location?.search??'').has('offline')&&!new URLSearchParams(globalThis.location?.search??'').has('mock');}
/** Call the same-origin backend with a hard eight-second browser deadline. @param {object} request @returns {Promise<object>} */
export async function requestLiveGuide(request){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const response=await fetch('/api/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:controller.signal});if(!response.ok)throw new LiveGuideError(`Guide HTTP ${response.status}`);return await response.json();}
 catch(error){if(error instanceof LiveGuideError)throw error;if(error.name==='AbortError'||error instanceof TypeError||error instanceof SyntaxError)throw new LiveGuideError(`Guide transport failed: ${error.name}`);throw error;}
 finally{clearTimeout(timer);}
}
/** Expected local API transport error; the UI offers curated fallback. */
export class LiveGuideError extends Error {}
