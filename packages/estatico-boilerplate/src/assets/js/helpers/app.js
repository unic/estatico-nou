/**
 * Init registered modules on specified events
 *
 * @license APLv2
 */
import $ from 'jquery';
import namespace from './namespace';

/** Demo modules * */
import SkipLinks from '../../../demo/modules/skiplinks/skiplinks';
import SlideShow from '../../../demo/modules/slideshow/slideshow';
/* autoinsertmodulereference */ // eslint-disable-line

class App {
  constructor() {
    // Module instances
    window[namespace].modules = {};

    this.initEvents = [];

    SkipLinks.init();

    // Module registry - mapping module name (used in data-init) to module Class
    this.modules = {};
    this.modules.slideshow = SlideShow;
    /* autoinsertmodule */ // eslint-disable-line

    // expose initModule function
    window[namespace].helpers.initModule = this.initModule;
  }

  start() {
    this.registerModules();
    this.initModuleInitialiser();
  }

  initModule(moduleName, $node) {
    const Module = window[namespace].modules[moduleName].Class;
    const metaData = $node.data(`${moduleName}-data`) || {};
    const metaOptions = $node.data(`${moduleName}-options`) || {};
    const moduleInstance = new Module($node, metaData, metaOptions);

    window[namespace].modules[moduleName].instances[moduleInstance.uuid] = moduleInstance;
    $node.data(`${moduleName}Instance`, moduleInstance);
  }

  registerModules() {
    $('[data-init]').each((key, element) => {
      const modules = $(element).data('init').split(' ');

      modules.forEach((moduleName) => {
        this.registerModule(moduleName);
      });
    });
  }

  registerModule(moduleName) {
    if (!window[namespace].modules[moduleName] && this.modules[moduleName]) {
      const Module = this.modules[moduleName];

      window[namespace].modules[moduleName] = {
        initEvents: Module.initEvents,
        events: Module.events,
        instances: {},
        Class: Module,
      };

      this.initEvents = this.initEvents.concat(Module.initEvents);

      // Remove duplicates from initEvents
      this.initEvents = [...new Set(this.initEvents)];
    }
  }

  isRegistered(moduleName) {
    return window[namespace].modules[moduleName];
  }

  isInitialised($element, moduleName) {
    // jQuery 3 does not allow kebab-case in data() when retrieving whole data object https://jquery.com/upgrade-guide/3.0/#breaking-change-data-names-containing-dashes
    return $element.data(`${moduleName}Instance`);
  }

  isInitEvent(eventType, moduleName) {
    return window[namespace].modules[moduleName].initEvents.indexOf(eventType) !== -1;
  }

  initModules(event) {
    $('[data-init]').each((key, element) => {
      const $element = $(element);
      const modules = $element.data('init').split(' ');

      modules.forEach((moduleName) => {
        if (this.isRegistered(moduleName)
          && !this.isInitialised($element, moduleName)
          && this.isInitEvent(event.type, moduleName)) {
          this.initModule(moduleName, $element);
        }
      });
    });
  }

  initModuleInitialiser() {
    if (!this.initEvents.length) {
      return;
    }

    // jQuery 3 does not support `ready` event in $(document).on() https://jquery.com/upgrade-guide/3.0/#breaking-change-on-quot-ready-quot-fn-removed
    // But lets sent 'ready' information to modules initialising on that event
    $(this.initModules.bind(this, { type: 'ready' }));
    $(document).on(this.initEvents.join(' '), this.initModules.bind(this));
  }
}

export default App;
