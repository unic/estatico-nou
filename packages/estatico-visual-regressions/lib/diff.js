const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

function getDiff(screenshotBuffer, referenceBuffer, pixelmatchConfig) {
  const reference = PNG.sync.read(referenceBuffer);
  const screenshot = PNG.sync.read(screenshotBuffer);

  const diff = new PNG({
    width: reference.width,
    height: reference.height,
  });

  // Get difference
  const diffPixels = pixelmatch(
    screenshot.data,
    reference.data,
    diff.data,
    reference.width,
    reference.height,
    pixelmatchConfig,
  );

  // Create combined image of reference, diff and screenshot (from left to write)
  const combined = new PNG({
    width: reference.width * 3,
    height: reference.height,
  });

  PNG.bitblt(reference, combined, 0, 0, reference.width, reference.height, 0, 0);
  PNG.bitblt(diff, combined, 0, 0, reference.width, reference.height, reference.width, 0);
  PNG.bitblt(screenshot, combined, 0, 0, reference.width, reference.height, reference.width * 2, 0);

  // Return number of different pixels and combined image
  return {
    pixels: diffPixels,
    buffer: PNG.sync.write(combined),
  };
}

module.exports = getDiff;
