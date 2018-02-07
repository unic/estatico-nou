const data = {
  slides: ['600/204', '600/205', '600/206'].map((size, index) => ({
    src: `http://www.fillmurray.com/${size}`,
    alt: `Bill Murray ${index + 4}`,
  })),
};

module.exports = data;
