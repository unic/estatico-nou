module.exports = {
  meta: {
    title: 'Default',
  },
  props: {
    firstName: 'Yay',
    age: 50,
  },
  variants: [
    {
      meta: {
        title: 'Variant A',
      },
      props: {
        firstName: 'Yay 2',
        age: 70,
      },
    },
  ],
};
