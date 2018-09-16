import bows from 'bows';
import A11y from './helpers/a11y';
import Inspector from './helpers/inspector';
import namespace from '../../../assets/js/helpers/namespace';

// Enable by default
// Remove these lines and run "localStorage.removeItem('debug');" to disable
if (window.localStorage && !localStorage.debug) {
  localStorage.debug = true;
}

window[namespace].helpers.log = bows;

const inspector = new Inspector();
const a11y = new A11y();

// Keyboard triggered helpers
document.onkeydown = (e) => {
  const event = e || window.event;

  if (event.keyCode === 77 && event.ctrlKey) { // ctrl+m
    inspector.run();
  } else if (e.keyCode === 65 && event.ctrlKey) { // ctrl+a
    a11y.run();
  }
};
