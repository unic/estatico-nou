/*!
 * {{className}}
 *
 * @author
 * @copyright
 */
import Module from '../../assets/js/helpers/module';
import namespace from '../../assets/js/helpers/namespace';

class {{className}} extends Module {
  constructor($element, data, options) {
    const defaultData = {
    };
    const defaultOptions = {
      domSelectors: {
        // item: '[data-$\{{{className}}.name}="item"]'
      },
      stateClasses: {
        // activated: 'is-activated'
      },
    };

    super($element, defaultData, defaultOptions, data, options);

    this.initUi();
    this.initEventListeners();
  }

  static get events() {
    return {
      // eventname: `eventname.${ {{className}}.name }.${ {{namespace}} }`
    };
  }

  /**
   * Initialisation of variables, which point to DOM elements
   */
  initUi() {
    // DOM element pointers
  }

  /**
   * Event listeners initialisation
   */
  initEventListeners() {
    // Event listeners
  }

  /**
   * Unbind events, remove data, custom teardown
   */
  destroy() {
    super.destroy();

    // Custom destroy actions go here
  }
}

export default {{className}};
