class Helper {
  /*
   * Create a console.log wrapper with optional namespace/context
   * Run "localStorage.debug = true;" to enable
   * Run "localStorage.removeItem('debug');" to disable
   * This is overwritten when in dev mode (see dev.js)

   * Usage inside a module:
   * "this.log('it's now initialised);"

   * Output:
   * `MyModule -> it's now initialised`

   * The output form depends on build flag - without --dev it will be plain message
   * with the --dev flag it will be more corefull message using bows plugin
   */
  log(context) {
    let fn = () => {};

    if (window.localStorage && localStorage.debug) {
      if (typeof context === 'string' && context.length > 0) {
        fn = Function.prototype.bind.call(console.log, console, `${context} ☞`);
      } else {
        fn = Function.prototype.bind.call(console.log, console);
      }
    }

    return fn;
  }

  // a simple event handler wrapper
  on(el, ev, callback) {
    if (el.addEventListener) {
      el.addEventListener(ev, callback, false);
    } else if (el.attachEvent) {
      el.attachEvent(`on${ev}`, callback);
    }
  }

  // Deep extend
  extend(destination, source) {
    let property;

    for (property in source) { // eslint-disable-line no-restricted-syntax
      if (source[property]
          && source[property].constructor
          && source[property].constructor === Object) {
        destination[property] = destination[property] || {}; // eslint-disable-line

        this.extend(destination[property], source[property]);
      } else {
        destination[property] = source[property]; // eslint-disable-line no-param-reassign
      }
    }

    return destination;
  }
}

export default Helper;
