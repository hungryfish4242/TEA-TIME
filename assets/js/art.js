/** Local generated illustrations, decoded once for offline screens and certificates. */
export const ART_PATHS={tea:'assets/img/cards/tea.webp',bun:'assets/img/cards/bun.webp',tart:'assets/img/cards/tart.webp'};
const images=new Map();
/** Decode the three local delivery images before marking the application ready. @returns {Promise<void>} */
export async function loadArt(){await Promise.all(Object.entries(ART_PATHS).map(async([id,path])=>{const image=new Image();image.src=path;await image.decode();images.set(id,image);}));}
/** Return an already decoded original illustration. @param {string} id @returns {HTMLImageElement} */
export function getArt(id){const image=images.get(id);if(!image)throw new Error(`Art not loaded: ${id}`);return image;}
