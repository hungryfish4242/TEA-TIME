import {getArt} from './art.js';
/** Normalize an optional name without storing or interpreting it. @param {string} name @returns {string} */
export function certificateName(name){return [...name.trim()].slice(0,24).join('')||'A visitor';}
/** Only a complete collection can generate a certificate. @param {import('./state.js').Session} session @returns {boolean} */
export function canGenerate(session){return ['tea','bun','tart'].every(id=>session.cards.includes(id))&&new Set(session.cards).size===3;}
/** Paint an original typographic certificate using local fonts and the shared generated illustrations. @param {HTMLCanvasElement} canvas @param {string} name @param {import('./state.js').Session} session @param {boolean} [preview] @returns {void} */
export function renderCertificate(canvas,name,session,preview=false){
 if(!canGenerate(session))throw new Error('A certificate requires three unique cards');
 canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D is unavailable');
 const ink='#153f35',red='#a33325';ctx.fillStyle='#f5efdf';ctx.fillRect(0,0,1080,1350);ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.strokeRect(40,40,1000,1270);ctx.lineWidth=1;ctx.strokeRect(52,52,976,1246);
 /** Draw a centered line with a specified local font. @param {string} text @param {number} y @param {string} font @param {string} [color] @returns {void} */
 function line(text,y,font,color=ink){ctx.font=font;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,540,y);}
 line('THE CHA CHAAN TENG TIME MACHINE',115,'18px "Trebuchet MS"');
 ctx.beginPath();ctx.moveTo(100,150);ctx.lineTo(980,150);ctx.stroke();
 line('THREE TABLES. ONE EVERYDAY STORY.',210,'15px "Trebuchet MS"');
 line('A little taste of',298,'italic 57px Georgia');line('something worth',366,'57px Georgia');line('keeping.',434,'italic 70px Georgia',red);
 for(let i=0;i<3;i++){
  const x=130+i*285;ctx.fillStyle=['#e2e6d2','#efe0bd','#e7dcc9'][i];ctx.fillRect(x,495,250,275);ctx.strokeStyle=ink;ctx.strokeRect(x,495,250,275);ctx.fillStyle=ink;ctx.font='16px "Trebuchet MS"';ctx.textAlign='left';ctx.fillText(`0${i+1}`,x+18,526);
  ctx.drawImage(getArt(['tea','bun','tart'][i]),x+30,540,190,190);
  ctx.font='13px "Trebuchet MS"';ctx.fillStyle=ink;ctx.textAlign='center';ctx.fillText(['MILK TEA','PINEAPPLE BUN','EGG TART'][i],x+125,740);
 }
 line('GUARDIAN OF CHA CHAAN TENG CULTURE',835,'17px "Trebuchet MS"');
 const full=certificateName(name),display=preview&&full.length>20?`${[...full].slice(0,19).join('')}…`:full;let size=48;ctx.font=`italic ${size}px Georgia`;while(ctx.measureText(display).width>850&&size>22){size--;ctx.font=`italic ${size}px Georgia`;}line(display,920,`italic ${size}px Georgia`,red);
 line('completed this development three-table journey.',974,'22px Georgia');
 line('AI FOR HUMANITY CARNIVAL · AIH5571',1052,'15px "Trebuchet MS"');line('The Hong Kong Polytechnic University',1085,'20px Georgia');
 ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(100,1132);ctx.lineTo(980,1132);ctx.stroke();
 line('Student-project prototype. AI-assisted interface; content pending review.',1180,'15px "Trebuchet MS"');
 line('Not an official heritage qualification.',1208,'15px "Trebuchet MS"');
 line('DEVELOPMENT ART & CONTENT · NOT FOR VISITORS',1252,'12px "Trebuchet MS"',red);
}
/** Generate a full-resolution local PNG. @param {string} name @param {import('./state.js').Session} session @returns {Promise<Blob>} */
export async function generateCertificate(name,session){const canvas=document.createElement('canvas');renderCertificate(canvas,name,session);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG encoding failed')),'image/png'));}
