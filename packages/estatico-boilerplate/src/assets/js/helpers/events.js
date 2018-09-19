import { Delegate } from 'dom-delegate';
import debounce from 'lodash/debounce';
import throttle from 'raf-throttle';

/**
 * Adds debounced and throttled global resize and scroll events and generates public methods
 * for adding handlers
 * e.g. for resize: addDebouncedResizeListener, for scroll: addDebouncedScrollListener
 *
 * @license APLv2
 *
 * @example
 * // Listen to debounced scroll event:
 * import WindowEventListener from './events';
 * WindowEventListener.addDebouncedScrollListener((event) => {
 *   this.log(event);
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

    this.eventDelegate = new Delegate(document);
    this.eventHandlers = {};

    for (const eventName of Object.keys(events)) { // eslint-disable-line no-restricted-syntax
      this.registerDebouncedEvent(eventName, events[eventName]);
      this.registerThrottledEvent(eventName, events[eventName]);
    }
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
    const methodName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
    const debouncedEventName = `debounced${methodName}`;

    window.addEventListener(eventName, debounce((event) => {
      this.dispatch(debouncedEventName, {
        originalEvent: event,
      });
    }, config.interval), false);

    // adds a public shorthand method, e.g. addResizeListener to the WindowEventListener class
    this[`addDebounced${methodName}Listener`] = this.addEventListener.bind(this, debouncedEventName);
    this[`removeDebounced${methodName}Listener`] = this.removeEventListener.bind(this, debouncedEventName);
  }

  /**
   * Window event has only one throttled handler.
   * Achieved by triggering another fake event, which is the one we subscribe to
   * @param {String} eventName
   * @private
   */
  registerThrottledEvent(eventName) {
    const methodName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
    const throttledEventName = `throttled${methodName}`;

    window.addEventListener(eventName, throttle((event) => {
      this.dispatch(throttledEventName, {
        originalEvent: event,
      });
    }));

    // adds a public shorthand method, e.g. addResizeListener to the WindowEventListener class
    this[`addThrottled${methodName}Listener`] = this.addEventListener.bind(this, throttledEventName);
    this[`removeThrottled${methodName}Listener`] = this.removeEventListener.bind(this, throttledEventName);
  }

  /**
   * Adds callback as an event listener to the fake event.
   * Uses unique ID if provided (might be handy to remove instance-specific handlers).
   * @param {String} eventName
   * @param {Function} callback
   * @param {String} uuid - optional
   * @private
   */
  addEventListener(eventName, callback, uuid) {
    const name = uuid ? `${eventName}.${uuid}` : eventName;

    // Keep track of handler
    this.eventHandlers[name] = callback;

    this.eventDelegate.on(eventName, callback);
  }

  /**
   * Remove a callback from a fake event
   * Uses unique ID if provided (might be handy to remove instance-specific handlers).
   * @param {String} eventName
   * @param {String} uuid - optional
   * @private
   */
  removeEventListener(eventName, uuid) {
    const name = uuid ? `${eventName}.${uuid}` : eventName;

    this.eventDelegate.off(eventName, this.eventHandlers[name]);
  }
}

// Export default instance
export default new WindowEventListener();
