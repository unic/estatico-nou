/**
 * Polyfills to be loaded by default
 *
 * Small polyfills we are being inlined
 * Larger ones are loaded async and only if needed
 *
 * If a polyfill is expected to be used only in exceptional cases it could make sense to load it
 * where needed instead of here
 */
import 'nodelist-foreach-polyfill';
import 'custom-event-polyfill';

export default async function loadPolyfills() {
  if (!window.fetch) {
    await import('whatwg-fetch');
  }
}
