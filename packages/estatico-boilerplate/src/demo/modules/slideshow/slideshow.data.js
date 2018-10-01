const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');

const template = dataHelper.getFileContent('slideshow.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: Slideshow',
    className: 'SlideShow',
    jira: 'JIRA-4',
    documentation: dataHelper.getDocumentation('slideshow.md'),
    mocks: [
      {
        description: null,
        data: dataHelper.getDataMock('slideshow.mock.js'),
      },
    ],
  },
  props: {
    slides: _.map(['600/201', '600/202', '600/203'], (size, index) => ({
      src: `http://www.fillmurray.com/${size}`,
      alt: `Bill Murray ${index + 1}`,
    })),
    data: JSON.stringify({
      i18n: {
        prev: 'Previous Slide',
        next: 'Next Slide',
      },
    }),
    options: JSON.stringify({
      url: '/mocks/demo/modules/slideshow/slideshow.json?delay=5000',
    }),
  },
});
const variants = _.mapValues({
  default: {
    meta: {
      title: 'Default',
      desc: 'Default implementation',
    },
  },
}, (variant) => {
  const variantProps = _.merge({}, data, variant).props;
  const compiledVariant = () => handlebars.compile(template)(variantProps);
  const variantData = _.merge({}, data, variant, {
    meta: {
      demo: compiledVariant,

      // code: {
      //  handlebars: dataHelper.getFormattedHandlebars(template),
      //  html: dataHelper.getFormattedHtml(compiledVariant),
      //  data: dataHelper.getFormattedJson(variantProps)
      // }
    },
  });

  return variantData;
});

data.variants = variants;

module.exports = data;
