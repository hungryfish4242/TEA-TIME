/** Guard hash routes against incomplete chapters. @param {string} hash @param {import('./state.js').Session} session @returns {string} */
export function resolveRoute(hash,session) {
  if(['#/bun','#/tart'].includes(hash))return '#/order';
  if(['#/scene','#/certificate'].includes(hash)&&session.cards.length!==3)return '#/order';
  return ['#/','#/order','#/tea','#/scene','#/certificate'].includes(hash)?hash:'#/';
}
