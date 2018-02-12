module.exports = (originalSize, crop) => {
  let targetSize = [];
  let focusCoordinates = [];
  let focusPoint = {};
  let postfix;

  if (typeof crop === 'string') {
    targetSize = crop.split('x');
    postfix = crop;
  } else if (crop.size) {
    targetSize = crop.size.split('x');
    postfix = crop.size;

    if (crop.focusPoint) {
      focusCoordinates = crop.focusPoint.split(',');
      postfix += `_${crop.focusPoint}`;
    }
  } else {
    // if only one dimension is defined
    // if only width is defined
    if (crop.width || typeof crop === 'number') {
      if (crop.width) {
        targetSize[0] = crop.width;
      } else if (typeof crop === 'number') {
        targetSize[0] = crop;
      }

      targetSize[1] = Math.floor((originalSize.height * targetSize[0]) / originalSize.width);
    } else if (crop.height) {
      // if only height is defined
      targetSize[1] = crop.height;
      targetSize[0] = Math.floor((originalSize.width * targetSize[1]) / originalSize.height);
    }

    postfix = `${targetSize[0]}x${targetSize[1]}`;
  }

  // setting focus point
  if (focusCoordinates.length > 0) {
    focusPoint = {
      width: focusCoordinates[0],
      height: focusCoordinates[1],
    };
  } else {
    // default focus point is image center
    focusPoint = {
      width: originalSize.width / 2,
      height: originalSize.height / 2,
    };
  }

  return {
    focusPoint,
    postfix,
    size: {
      width: targetSize[0],
      height: targetSize[1],
    },
  };
};
