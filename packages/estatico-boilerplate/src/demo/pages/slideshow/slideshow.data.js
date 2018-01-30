'use strict';

var _ = require('lodash'),
    dataHelper = require('../../../../helpers/data.js'),
    defaultData = require('../../../data/default.data.js'),
    data = _.merge(defaultData, {
        meta: {
            title: 'Demo: 05 Unit test on page',
            testScripts: [
                dataHelper.getTestScriptPath('../../modules/slideshow/slideshow.test.js')
            ]
        },
        props: {
            title: 'Unit test',
            text: 'This page demonstrates the customized initialization of a module and allows to run its JavaScript unit tests.',
            modules: {
                skiplinks: require('../../modules/skiplinks/skiplinks.data.js').props,
                slideshow: require('../../modules/slideshow/slideshow.data.js').props
            }
        }
    });

module.exports = data;
