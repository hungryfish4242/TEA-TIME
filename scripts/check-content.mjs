/** Validate repository content and reject development data in production mode. */
import {readFile} from 'node:fs/promises';
import {validateChapter} from '../assets/js/content.js';
const sources=JSON.parse(await readFile(new URL('../content/sources.json',import.meta.url),'utf8'));
for(const id of ['tea','bun','tart']){
 const chapter=JSON.parse(await readFile(new URL(`../content/chapters/${id}.dev.json`,import.meta.url),'utf8'));
 validateChapter(chapter,sources,!process.argv.includes('--dev'));
}
console.log(process.argv.includes('--dev')?'PASS: development content is structurally valid':'PASS: production content is valid');
