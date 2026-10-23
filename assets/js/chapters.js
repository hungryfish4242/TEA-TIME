/** Shared chapter metadata; ordered keys define sequential table access. */
export const CHAPTERS={
 tea:{number:'01',title:'Silk-stockings milk tea',short:'tea',guide:'The Tea Master',guideId:'tea_master',idea:'Craft',topics:['craft','ratio','origin'],type:'tea_pour'},
 bun:{number:'02',title:'Pineapple bun with butter',short:'bun',guide:'The Bakery Auntie',guideId:'bakery_auntie',idea:'Fusion',topics:['crust','butter','name'],type:'bun_build'},
 tart:{number:'03',title:'Hong Kong egg tart',short:'tart',guide:'The Next Generation',guideId:'third_generation_owner',idea:'Transmission',topics:['migration','schools','craft'],type:'tart_inspect'}
};
export const CHAPTER_IDS=Object.keys(CHAPTERS);
/** Resolve sequential access without mutating older visits. @param {object} session @param {string} id @returns {boolean} */
export function canVisit(session,id){const index=CHAPTER_IDS.indexOf(id);return index===0||(index>0&&(['available','in_progress','complete'].includes(session.chapters[id]?.status)||session.chapters[CHAPTER_IDS[index-1]]?.status==='complete'));}
