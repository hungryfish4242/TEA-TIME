/** Development build configuration; production must reject development content. */
export const CONFIG = Object.freeze({production:false,appVersion:'0.1.0',contentVersion:'dev-0.1',bpm:72,goodMs:250,retryGoodMs:350,timeoutMs:8000});
/** Parse supported query parameters. @param {string} search @returns {{mode:string,dev:boolean,fail:boolean,reset:boolean}} */
export function readMode(search) { const p=new URLSearchParams(search);return {mode:p.get('mode')==='kiosk'?'kiosk':'phone',dev:p.get('dev')==='1',fail:p.get('mock')==='fail',reset:p.get('reset')==='1'}; }
