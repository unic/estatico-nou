'use strict';

var _ = require('lodash'),
    dataHelper = require('../../../helpers/data.js'),
    defaultData = require('../../data/default.data.js'),
    data = _.merge(defaultData, {
        meta: {
            title: 'Colors'
        },
        colors: dataHelper.getColors('../../assets/css/data/colors.json'),
        additionalLayoutClass: 'sg_colors'
    });

module.exports = data;
