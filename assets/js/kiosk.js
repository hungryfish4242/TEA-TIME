/** @typedef {{route:()=>string,onAttract:(visible:boolean)=>void,onCountdown:(seconds:number|null)=>void,onReset:()=>void}} KioskOptions */
/** Monitor only entry and certificate idle states; never interrupt a chapter. @param {KioskOptions} options @returns {{activity:()=>void,stop:()=>void}} */
export function createKioskController(options){
 let lastActive=Date.now(),deadline=null,attracted=false,lastSeconds=null;
 /** Cancel idle UI and begin a new activity window. @returns {void} */
 function activity(){lastActive=Date.now();deadline=null;if(attracted){attracted=false;options.onAttract(false);}if(lastSeconds!==null){lastSeconds=null;options.onCountdown(null);}}
 /** Evaluate elapsed wall-clock time rather than counting intervals. @returns {void} */
 function tick(){const route=options.route(),now=Date.now();if(route!=='#/'&&route!=='#/certificate'){activity();return;}if(route==='#/'){if(now-lastActive>=45000&&!attracted){attracted=true;options.onAttract(true);}return;}if(deadline===null&&now-lastActive>=60000)deadline=now+10000;if(deadline!==null){const seconds=Math.max(0,Math.ceil((deadline-now)/1000));if(seconds===0){activity();options.onReset();}else if(seconds!==lastSeconds){lastSeconds=seconds;options.onCountdown(seconds);}}}
 const timer=setInterval(tick,250);return {activity,stop(){clearInterval(timer);}};
}
