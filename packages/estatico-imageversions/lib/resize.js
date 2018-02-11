function generateImage(imgData, focus, size, options) {
  const ratio = size.width / size.height;

  // Calculating necessary crop values
  let { width } = imgData.imgSize;
  let height = Math.round(imgData.imgSize.width / ratio);

  if (height > imgData.imgSize.height) {
    ({ height } = imgData.imgSize.height);
    width = Math.round(imgData.imgSize.height * ratio);
  }

  const fx = Math.round((focus.width * width) / imgData.imgSize.width);
  const fy = Math.round((focus.height * height) / imgData.imgSize.height);

  // Crop
  // Params: resulting width, resulting height, left top corner x coordinate,
  // left top corner y coordinate
  imgData.img.crop(width, height, focus.width - fx, focus.height - fy);

  // Resize crop result to requested size
  imgData.img.resize(size.width, size.height, '!');

  // Draw size on image to allow for easier testing of responsive images
  if (options && options.addSizeWatermark) {
    imgData.img.fontSize(16).box('#fff').fill('#000')
      .drawText(20, 16, `${size.width}x${size.height}`, 'southeast');
  }

  return imgData.img;
}

module.exports = generateImage;
