import $ from 'jquery';
import extend from 'lodash/extend';
import uniqueId from 'lodash/uniqueId';
import namespace from './namespace';

class Module {
  /**
   * Helper Class
   * @param  {jQuery DOM} $element - jQuery DOM element where to initialise the module
   * @param  {object} _defaultData - The default data object
   * @param  {object} _defaultOptions - The default options object
   * @param  {object} data - The data passed for this Module
   * @param  {object} options - The options passed as data attribute in the Module
   */
  constructor($element, _defaultData, _defaultOptions, data, options) {
    this.name = this.constructor.name.toLowerCase();

    this.ui = {
      $element,
    };

    const globalData = window[namespace].data[this.name];
    const globalOptions = window[namespace].options[this.name];

    this.data = extend({}, _defaultData, globalData, data);
    this.options = extend({}, _defaultOptions, globalOptions, options);

    // Identify instance by UUID
    this.uuid = uniqueId(this.name);

    this.log = window[namespace].helpers.log(this.name);

    // Expose original log helper
    this._log = window[namespace].helpers.log; // eslint-disable-line no-underscore-dangle
  }

  static get initEvents() {
    return ['ready', 'ajax_loaded'];
  }

  /**
   * Destroy method
   *
   * Should be overwritten in module if there are additional DOM elements, DOM data
   * and event listeners to remove
   *
   * Use cases:
   * - Unbind (namespaced) event listeners
   * - Remove data from DOM elements
   * - Remove elements from DOM
   */
  destroy() {
    // Remove event listeners connected to this instance
    this.ui.$element.off(`.${this.uuid}`);
    $(document).off(`.${this.uuid}`);

    // Delete references to instance
    this.ui.$element.removeData(`${this.name}Instance`);

    delete window[namespace].modules[this.name].instances[this.uuid];
  }
}

export default Module;
