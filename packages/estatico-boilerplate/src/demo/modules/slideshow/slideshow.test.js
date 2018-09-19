describe('Slideshow Tests', () => {
  let page;

  beforeAll(async () => {
    // eslint-disable-next-line no-underscore-dangle
    const url = `http://localhost:${global.__STATIC_PORT__}/demo/modules/slideshow/slideshow.html`;

    // eslint-disable-next-line no-underscore-dangle
    page = await global.__BROWSER__.newPage();

    page.on('pageerror', console.log);

    await page.goto(url, {
      waitUntil: ['networkidle2'],
    });
  });

  afterEach(async () => {
    await page.reload();
  });

  afterAll(async () => {
    await page.close();
  });

  it('should load without error', async () => {
    const text = await page.evaluate(() => document.body.textContent);

    expect(text).toContain('Slideshow');
  });

  it('should return initial image source', async () => {
    const src = await page.evaluate(async () => {
      const img = document.querySelector('[data-slideshow="slide"] img');

      return img.src;
    });

    expect(src).toBe('http://www.fillmurray.com/600/201');
  });

  it('should change the active slide on "next" button click', async () => {
    const currentItem = await page.evaluate(async () => {
      const button = document.querySelector('[data-slideshow="next"]');
      const uuid = document.querySelector('[data-init="slideshow"]').dataset.slideshowInstance;

      await button.click();

      return window.estatico.modules.slideshow.instances[uuid].currentItem;
    });

    expect(currentItem).toBe(1);
  });
});
