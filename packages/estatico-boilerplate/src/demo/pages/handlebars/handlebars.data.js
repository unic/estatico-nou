'use strict';

var _ = require('lodash'),
    defaultData = require('../../../data/default.data.js'),
    data = _.merge(defaultData, {
        meta: {
            title: 'Demo: 04 Handlebars helpers'
        },
        props: {
            title: 'Handlebars helpers',
            text: 'This page demonstrates the use of a some handlebars helpers (see helpers/handlebars.js).',
            warning: 'WARNING: Use them with caution, they currently won\'t work on the client-side when precompiling templates.',
            partial: 'demo/modules/slideshow/slideshow',
            partialPlaceholder: 'slideshow',
            partials: [
                {
                    placeholder: 'slideshow'
                }
            ],
            testString: 'hello world',
            subString: 'hello',
            testString2: 'hello world',
            modules: {
                skiplinks: require('../../modules/skiplinks/skiplinks.data.js').props,
                slideshow: require('../../modules/slideshow/slideshow.data.js').props
            }
        }
    });

module.exports = data;
