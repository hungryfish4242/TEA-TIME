/** Offer the generated PNG to the device share sheet, preserving cancellation semantics. @param {Blob} blob @param {Navigator|object} [device] @returns {Promise<string>} */
export async function shareCertificate(blob,device=globalThis.navigator){
 const data={title:'The Cha Chaan Teng Time Machine',files:[new File([blob],'cha-chaan-teng-certificate.png',{type:'image/png'})]};
 if(!device?.canShare?.(data)||typeof device.share!=='function')return 'download';
 try{await device.share(data);return 'shared';}
 catch(error){if(error.name==='AbortError')return 'cancelled';if(['NotAllowedError','NotSupportedError','DataError'].includes(error.name))return 'download';throw error;}
}
