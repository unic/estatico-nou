import EventDelegate from 'dom-delegate';
import debounce from 'lodash/debounce';
import throttle from 'raf-throttle';
import namespace from './namespace';

/**
 * Adds debounced and throttled global resize and scroll events
 *
 * @license APLv2
 *
 * @example
 * // Listen to debounced scroll event:
 * import WindowEventListener from './events';
 * WindowEventListener.on('debouncedScroll', (originalEvent, event) => {
 *   this.log(event, originalEvent);
 * });
 */

class WindowEventListener {
  constructor() {
    const events = {
      resize: {
        interval: 50,
      },
      scroll: {
        interval: 50,
      },
    };

    this.eventDelegate = new EventDelegate(document);

    for (const eventName of Object.keys(events)) { // eslint-disable-line no-restricted-syntax
      this.registerDebouncedEvent(eventName, events[eventName]);
      this.registerThrottledEvent(eventName, events[eventName]);
    }
  }

  /**
   * Add debounced/throttled listener, i.e. WindowEventListener.on('debouncedScroll', fn)
   * @param {String} eventName
   * @param {Function} fn
   */
  on(eventName, fn) {
    return this.eventDelegate.on(eventName, fn);
  }

  /**
   * Remove debounced/throttled listener, i.e. WindowEventListener.off('debouncedScroll', fn)
   * @param {String} eventName
   * @param {Function} fn
   */
  off(eventName, fn) {
    return this.eventDelegate.off(eventName, fn);
  }

  /**
   * Dispatch custom event on document
   * @param {String} eventName
   * @param {Object} data
   */
  dispatch(eventName, data) {
    this.eventDelegate.rootElement.dispatchEvent(new CustomEvent(eventName, {
      detail: data,
    }));
  }

  /**
   * Window event has only one debounced handler.
   * Achieved by triggering another fake event, which is the one we subscribe to
   * @param {String} eventName
   * @param {Object} config
   * @private
   */
  registerDebouncedEvent(eventName, config) {
    const debouncedEventName = `debounced${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;

    window.addEventListener(eventName, debounce((event) => {
      this.dispatch(debouncedEventName, {
        originalEvent: event
      });
    }, config.interval), false);
  }

  /**
   * Window event has only one throttled handler.
   * Achieved by triggering another fake event, which is the one we subscribe to
   * @param {String} eventName
   * @private
   */
  registerThrottledEvent(eventName, config) {
    const throttledEventName = `throttled${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;

    window.addEventListener(eventName, throttle((event) => {
      this.dispatch(throttledEventName, {
        originalEvent: event
      });
    }));
  }
}

// Export default instance
export default new WindowEventListener();
