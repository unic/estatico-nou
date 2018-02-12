/**
 * Resize / crop gm file
 * @param {object} image - original gm file
 * @param {object} focus - crop focus (width/height)
 * @param {object} size - target size (width/height)
 * @param {object} [options]
 * @return {object} gm file
 */
function resizeImage(image, resizeConfig, options) {
  const originalSize = image.data.size;
  const ratio = resizeConfig.size.width / resizeConfig.size.height;

  // Calculating necessary crop values
  let { width } = originalSize;
  let height = Math.round(originalSize.width / ratio);

  if (height > originalSize.height) {
    ({ height } = originalSize.height);
    width = Math.round(originalSize.height * ratio);
  }

  const fx = Math.round((resizeConfig.focusPoint.width * width) / originalSize.width);
  const fy = Math.round((resizeConfig.focusPoint.height * height) / originalSize.height);

  // Crop
  const resizedImage = image.crop(
    width, height,
    resizeConfig.focusPoint.width - fx, // left top corner x coordinate
    resizeConfig.focusPoint.height - fy, // // left top corner y coordinate
  );

  // Resize crop result to requested size
  resizedImage.resize(resizeConfig.size.width, resizeConfig.size.height, '!');

  // Draw size on image to allow for easier testing of responsive images
  if (options && options.addSizeWatermark) {
    resizedImage.fontSize(16).box('#fff').fill('#000')
      .drawText(20, 16, `${resizeConfig.size.width}x${resizeConfig.size.height}`, 'southeast');
  }

  return resizedImage;
}

module.exports = resizeImage;
