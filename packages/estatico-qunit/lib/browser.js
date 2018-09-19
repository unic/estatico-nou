/* eslint-disable no-var,prefer-arrow-callback,func-names */
import $ from 'jquery';
import QUnit from 'qunitjs';

import 'qunitjs/qunit/qunit.css';

QUnit.config.autostart = false;

$(function () {
  var $container = $('#qunit');
  var $button = $('<button>Run QUnit tests</button>');

  function startTests() {
    $container.show();
    $button.remove();

    QUnit.start();
  }

  if ($.isEmptyObject(QUnit.urlParams)) {
    $container.hide();

    $button
      .insertAfter($container)
      .on('click', startTests);
  } else {
    startTests();
  }
});
