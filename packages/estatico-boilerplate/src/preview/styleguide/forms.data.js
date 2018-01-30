'use strict';

var _ = require('lodash'),
    dataHelper = require('../../../helpers/data.js'),
    defaultData = require('../../data/default.data.js'),
    data = _.merge(defaultData, {
        meta: {
            title: 'Form Elements'
        },
        additionalLayoutClass: 'sg_forms'
    });

module.exports = data;
