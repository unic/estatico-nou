const $ = require('jquery');
const QUnit = require('qunit');

const moduleName = 'slideshow';
const $node = $(`.mod_${moduleName}`).eq(0);
let instance;

// Setup QUnit module
QUnit.module('slideshow', {
  beforeEach() {
    instance = $node.data(`${moduleName}Instance`);
  },

  afterEach() {
    instance.destroy();
    estatico.helpers.initModule(moduleName, $node);
  },
});

QUnit.test('Test correct plugin registration', (assert) => {
  assert.expect(1);

  assert.equal(typeof instance, 'object', 'Plugin instance is an object');
});

QUnit.test('Test correct plugin init', (assert) => {
  assert.expect(7);

  const $buttons = $node.find(`button[data-${moduleName}]`);
  const events = $._data($node.get(0), 'events') || {}; // eslint-disable-line no-underscore-dangle
  const clickEvents = $.grep(events.click || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  const docEvents = $._data(document, 'events'); // eslint-disable-line no-underscore-dangle
  const resizeEvent = $.grep(docEvents[estatico.events.debouncedresize.split('.')[0]] || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  const scrollEvent = $.grep(docEvents[estatico.events.throttledscroll.split('.')[0]] || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  const mqEvent = $.grep(docEvents[estatico.events.mq.split('.')[0]] || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  assert.equal($buttons.length, 2, 'Two buttons found');

  assert.equal(clickEvents.length, 2, 'Two click events attached to slideshow');

  assert.equal(events.click[0].selector.toLowerCase(), `[data-${moduleName}="prev"]`, 'Prev button event reporting correct selector');
  assert.equal(events.click[1].selector.toLowerCase(), `[data-${moduleName}="next"]`, 'Next button event reporting correct selector');

  assert.equal(resizeEvent.length, 1, 'Resize event set');
  assert.equal(scrollEvent.length, 1, 'Scroll event set');
  assert.equal(mqEvent.length, 1, 'Media-query event set');
});

QUnit.test('Test correct plugin destroy', (assert) => {
  assert.expect(5);

  instance.destroy();

  const $buttons = $node.find(`button[data-${moduleName}]`);
  const events = $._data($node.get(0), 'events') || {}; // eslint-disable-line no-underscore-dangle
  const clickEvents = $.grep(events.click || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  const docEvents = $._data(document, 'events'); // eslint-disable-line no-underscore-dangle
  const resizeEvent = $.grep(docEvents[estatico.events.debouncedresize.split('.')[0]] || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  const scrollEvent = $.grep(docEvents[estatico.events.throttledscroll.split('.')[0]] || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  const mqEvent = $.grep(docEvents[estatico.events.mq.split('.')[0]] || [], event => $.inArray(instance.uuid, event.namespace.split('.')) !== -1);

  assert.equal($buttons.length, 0, 'No more button found');

  assert.equal(clickEvents.length, 0, 'No more click events attached to slideshow');

  assert.equal(resizeEvent.length, 0, 'Resize event unset');
  assert.equal(scrollEvent.length, 0, 'Scroll event unset');
  assert.equal(mqEvent.length, 0, 'Media-query event unset');
});

QUnit.test('Test whether clicking prev button updates "currentItem" property', (assert) => {
  assert.expect(1);

  const $button = $node.find('button.next');

  $button.trigger('click');

  assert.equal(instance.currentItem, 1, 'currentItem is 1');
});

QUnit.test('Test whether "show" method updates "currentItem" property', (assert) => {
  assert.expect(1);

  instance.show(2);

  assert.equal(instance.currentItem, 2, 'currentItem is 2');
});
