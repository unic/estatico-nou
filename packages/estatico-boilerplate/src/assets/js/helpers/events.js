import $ from 'jquery';
import debounce from 'lodash/debounce';
import throttle from 'raf-throttle';
import namespace from './namespace';

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
 * WindowEventListener.addDebouncedScrollListener((originalEvent, event) => {
 *   this.log(event, originalEvent);
 * });
 */

class WindowEventListener {
  constructor() {
    this.$window = $(window);

    const events = {
      resize: {
        interval: 50,
      },
      scroll: {
        interval: 50,
      },
    };

    for (const eventName of Object.keys(events)) { // eslint-disable-line no-restricted-syntax
      this.registerDebouncedEvent(eventName, events[eventName]);
      this.registerThrottledEvent(eventName, events[eventName]);
    }
  }

  /**
   * Window event has only one debounced handler.
   * Achieved by triggering another fake event, which is the one we subscribe to
   * @param {String} eventName
   * @param {Object} config
   * @private
   */
  registerDebouncedEvent(eventName, config) {
    const debouncedEventName = `debounced${eventName}.${namespace}`;
    const methodName = eventName.charAt(0).toUpperCase() + eventName.slice(1);

    this.$window.on(eventName, debounce((event) => {
      $(document).triggerHandler(debouncedEventName, event);
    }, config.interval));

    // adds a public shorthand method, e.g. addResizeListener to the WindowEventListener class
    this[`addDebounced${methodName}Listener`] = this.addEventListener.bind(this, debouncedEventName);
    this[`removeDebounced${methodName}Listener`] = this.removeEventListener.bind(this, debouncedEventName);

    // Save to global namespace
    $.extend(true, window[namespace], { events: {} });
    window[namespace].events[debouncedEventName.split('.')[0]] = debouncedEventName;
  }

  /**
   * Window event has only one throttled handler.
   * Achieved by triggering another fake event, which is the one we subscribe to
   * @param {String} eventName
   * @private
   */
  registerThrottledEvent(eventName) {
    const throttledEventName = `throttled${eventName}.${namespace}`;
    const methodName = eventName.charAt(0).toUpperCase() + eventName.slice(1);

    this.$window.on(eventName, throttle((event) => {
      $(document).triggerHandler(throttledEventName, event);
    }));

    // adds a public shorthand method, e.g. addResizeListener to the WindowEventListener class
    this[`addThrottled${methodName}Listener`] = this.addEventListener.bind(this, throttledEventName);
    this[`removeThrottled${methodName}Listener`] = this.removeEventListener.bind(this, throttledEventName);

    // Save to global namespace
    $.extend(true, window[namespace], { events: {} });
    window[namespace].events[throttledEventName.split('.')[0]] = throttledEventName;
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

    $(document).on(name, callback);
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

    $(document).off(name);
  }
}

// Exports an INSTANCE
export default new WindowEventListener();
