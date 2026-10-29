/**
 * Where the reader is, for the masthead, before the page has hydrated.
 *
 * The front page's masthead takes the colours of whatever is under it: clear
 * over the first screen, a dark pane over the rest of the night, a white one
 * over the paper after it. Those come from observers (`glass-page.tsx`), and
 * observers start with the page's script. A browser that puts the reader back
 * where they were, on a reload or at a link to a section, paints the server's
 * markup there first, and the server can only guess the first screen's. For as
 * long as the script took, which on a slow phone is seconds, that was a pale
 * bar over white paper: a bar with nothing legible in it.
 *
 * So a small script in the head watches the scroll until the page takes over
 * and says what it finds on the document, with two attributes the stylesheet
 * reads until the page's own state is there (`:not([data-bar-live])`):
 *
 * - `data-bar-pane`: the first screen has gone, so the masthead is a pane.
 * - `data-bar-day`: the night has gone, so the masthead is over paper.
 *
 * It asks the same two questions as the observers, of the same two markers
 * (`.glass-sentinel` and `.glass-dusk`), so the hand-over to the page's own
 * state changes nothing the reader can see. It reads on every scroll (on an
 * animation frame), when the document has parsed, when it has loaded and when
 * it is shown again from the browser's cache; it stops the moment the page
 * says its own state is in place (`data-bar-live`, set before paint by the
 * same effect that reads it). That is the page's mark and not the document's
 * `data-hydrated`, which the root sets when it attaches: the front page can
 * attach a moment after, and the bar would spend that moment in the wrong
 * colours. On any page without the markers it finds nothing, and once the
 * document has loaded it takes its listeners off: it is only for the first
 * paint of a front page the server drew.
 *
 * Without a script at all there is no one to ask, so the stylesheet makes the
 * masthead a white pane for that visitor: `@media (scripting: none)`.
 */

export const paneAttribute = 'data-bar-pane'
export const dayAttribute = 'data-bar-day'
export const liveAttribute = 'data-bar-live'

export const mastheadHeadScript = `try{(function(){var d=document.documentElement,q=0;function o(){removeEventListener('scroll',g);removeEventListener('pageshow',f);removeEventListener('load',f);removeEventListener('DOMContentLoaded',f)}function f(){q=0;if(d.hasAttribute('${liveAttribute}')){o();return}var s=document.querySelector('.glass-sentinel'),k=document.querySelector('.glass-dusk');if(!s||!k){if(document.readyState==='complete')o();return}d.toggleAttribute('${paneAttribute}',s.getBoundingClientRect().bottom<0);d.toggleAttribute('${dayAttribute}',k.getBoundingClientRect().top<0)}function g(){q||(q=requestAnimationFrame(f))}addEventListener('scroll',g,{passive:true});addEventListener('DOMContentLoaded',f);addEventListener('load',f);addEventListener('pageshow',f)})()}catch(e){}`
