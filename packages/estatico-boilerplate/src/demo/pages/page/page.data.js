'use strict';

var _ = require('lodash'),
    defaultData = require('../../../data/default.data.js'),
    data = _.merge(defaultData, {
        meta: {
            title: 'Demo: 01 Page'
        },
        props: {
            title: 'Page',
            text: 'This page demonstrates the inclusion of a module.',
            modules: {
                skiplinks: require('../../modules/skiplinks/skiplinks.data.js').props,
                teasers: require('../../modules/teasers/teasers.data.js').props
            }
        }
    });

module.exports = data;
