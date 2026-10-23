let returnFocus=null;
/** Open a native focus-trapping modal and remember its trigger. @param {HTMLDialogElement} dialog @param {HTMLElement} trigger @returns {void} */
export function openDialog(dialog,trigger){if(!dialog.open)returnFocus=trigger;if(!dialog.open)dialog.showModal();dialog.querySelector('button, input, [tabindex]')?.focus();}
/** Restore the visitor's keyboard position after dismissal. @param {HTMLDialogElement} dialog @returns {void} */
export function setupDialog(dialog){dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else document.querySelector('main h1')?.focus({preventScroll:true});});}
