/**
 * Polyfills to be loaded by default
 *
 * Small polyfills we are being inlined
 * Larger ones are loaded async and only if needed
 *
 * If a polyfill is expected to be used only in exceptional cases it could make sense to load it
 * where needed instead of here
 *
 * !IMPORTANT! Check with core-js to see which polyfills are included for you
 * automatically with @babel/preset-env
 * Website: https://www.npmjs.com/package/core-js
 */
import 'mdn-polyfills/NodeList.prototype.forEach';
import 'mdn-polyfills/CustomEvent';

/**
 * loadPolyfills
 * Tests for surtain functionality and adds polyfills when functionality is not found
 * @return {Promise} - Resolves when all async polyfills are loaded
 */
export default function loadPolyfills() {
  const requiredPolyfills = [];

  if (!window.fetch) {
    requiredPolyfills.push(import('whatwg-fetch'));
  }

  return Promise.all(requiredPolyfills);
}
