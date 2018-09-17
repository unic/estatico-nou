/**
 * Trigger custom events when changing breakpoint, get breakpoints from CSS properties
 *
 * @license APLv2
 *
 * @example
 * import MediaQuery from '../../../assets/js/modules/mediaqueries';
 *
 * // Listen to custom (debounced) event to react to viewport changes:
 * MediaQuery.addMQChangeListener((event) => {
 *   console.log(event.detail.prevBreakpoint); // { name: "small", value: "768px" }
 *   console.log(parseInt(event.detail.prevBreakpoint.value)); // "768"
 * });
 *
 * // Check the current viewport against a specific breakpoint:
 * if (MediaQuery.query({ from: 'small' })) {
 *   this.destroySmall();
 *   this.initLarge();
 * }
 * // or
 * if (MediaQuery.query({ from: 'small', to: 'medium' })) {
 *   this.destroySmall();
 *   this.initMedium();
 * }
 */

import { Delegate } from 'dom-delegate';
import WindowEventListener from './events';

class MediaQuery {
  constructor() {
    this.eventDelegate = new Delegate(document);
    this.eventHandlers = {};
    this.customEventName = 'mq';

    this.ui = {
      all: document.head,
      current: document.querySelector('title'),
    };

    const breakpointsString = window.getComputedStyle(this.ui.all).getPropertyValue('font-family');
    const currentBreakpointString = this.getCurrentBreakpointString();

    this.breakpoints = this.parseCssProperty(breakpointsString);
    this.currentBreakpoint = this.parseCssProperty(currentBreakpointString);

    WindowEventListener.addDebouncedResizeListener(() => {
      const breakpoint = this.parseCssProperty(this.getCurrentBreakpointString());
      const prevBreakpoint = this.currentBreakpoint;

      if (breakpoint && breakpoint.name !== this.currentBreakpoint.name) {
        this.currentBreakpoint = breakpoint;

        WindowEventListener.dispatch(this.customEventName, {
          prevBreakpoint,
          breakpoint,
        });
      }
    }, this.customEventName);
  }

  addMQChangeListener(callback, uuid) {
    this.eventHandlers[uuid] = callback;

    this.eventDelegate.on(this.customEventName, callback);
  }

  removeMQChangeListener(uuid) {
    this.eventDelegate.off(this.customEventName, this.eventHandlers[uuid]);
  }

  parseCssProperty(str) {
    return JSON.parse(str.replace(/^('|")|(\\)|('|")$/g, '').trim());
  }

  getCurrentBreakpointString() {
    return window.getComputedStyle(this.ui.current).getPropertyValue('font-family');
  }

  getBreakpointValue(breakpoint) {
    if (this.breakpoints[breakpoint] === undefined) {
      throw new Error(`Breakpoint not found: "${breakpoint}"`);
    }

    return parseInt(this.breakpoints[breakpoint], 10);
  }

  query(options) {
    let breakpointFrom;
    let breakpointTo;
    const breakpointCurrent = parseInt(this.currentBreakpoint.value, 10);

    if (typeof options !== 'object') {
      // No or wrong arguments passed
      throw new Error(`Illegal argument of type "${typeof options}", expected "object"`);
    }

    if (options.to === undefined && options.from === undefined) {
      throw new Error('No values for "to" or "from" received');
    }

    if (options.to !== undefined && options.from !== undefined) {
      breakpointFrom = this.getBreakpointValue(options.from);
      breakpointTo = this.getBreakpointValue(options.to);

      // "from" cannot be larger than "to"
      if (breakpointFrom > breakpointTo) {
        throw new Error(`Breakpoint ${breakpointFrom} is larger than ${breakpointTo}`);
      }

      // The breakpoint needs to smaller than the "to" (exclusive)
      // but larger or the same as "from" (inclusive)
      return breakpointFrom <= breakpointCurrent && breakpointCurrent < breakpointTo;
    }

    if (options.to !== undefined) {
      // Breakpoint needs to smaller than the "to" (exclusive)
      return breakpointCurrent < this.getBreakpointValue(options.to);
    }

    if (options.from !== undefined) {
      // Breakpoint needs larger or the same as "from" (inclusive)
      return breakpointCurrent >= this.getBreakpointValue(options.from);
    }

    return true;
  }
}

// Exports an INSTANCE
export default new MediaQuery();
