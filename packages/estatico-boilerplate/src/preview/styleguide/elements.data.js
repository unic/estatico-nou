'use strict';

var _ = require('lodash'),
    defaultData = require('../../data/default.data.js'),
    data = _.merge({}, defaultData, {
        meta: {
            title: 'Elements'
        },
        additionalLayoutClass: 'sg_elements'
    });

module.exports = data;
