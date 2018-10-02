module.exports = {
  meta: {
    title: 'Default',
    schema: require('./schema.json'), // eslint-disable-line global-require
  },
  props: {
    age: 50,
  },
  variants: [
    {
      meta: {
        title: 'Variant A',
      },
      props: {
        firstName: 'Yay 2',
        age: '50',
      },
    },
  ],
};
