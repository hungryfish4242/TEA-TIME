/** Check local delivery size and the contrast of the actual theme colors. */
import {readFile,readdir,stat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
/** Enumerate application files recursively. @param {string} directory @returns {Promise<string[]>} */
async function files(directory){const entries=await readdir(directory,{withFileTypes:true});const groups=await Promise.all(entries.map(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]));return groups.flat();}
const all=[path.join(root,'index.html'),...await files(path.join(root,'assets')),...await files(path.join(root,'content'))];
let total=0,delivery=0;
for(const file of all){total+=(await stat(file)).size;if(!file.endsWith('.png'))delivery+=gzipSync(await readFile(file)).length;}
if(total>15*1024*1024||delivery>2.5*1024*1024)throw new Error(`Package exceeds budget: ${total} total, ${delivery} initial gzipped`);
const css=await readFile(path.join(root,'assets/css/app.css'),'utf8');
/** Get one named theme color from its declaration. @param {string} name @returns {string} */
function color(name){const match=css.match(new RegExp(`--${name}:(#[0-9a-f]{6})`));if(!match)throw new Error(`Theme color missing: ${name}`);return match[1];}
/** Compute WCAG relative luminance from an sRGB hex color. @param {string} hex @returns {number} */
function luminance(hex){const values=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
const contrast={};
for(const foreground of ['ink','red','muted'])for(const background of ['cream','paper']){const a=luminance(color(foreground)),b=luminance(color(background)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)throw new Error(`Contrast failed: ${foreground}/${background}: ${ratio}`);contrast[`${foreground}/${background}`]=Number(ratio.toFixed(2));}
console.log(JSON.stringify({applicationBytesIncludingPngMasters:total,initialGzipBytes:delivery,contrast},null,2));
