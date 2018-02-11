module.exports = function (originalSize, crop) {
  var newPath,
    newSizeValues = [],
    focusPointCoordinates = [],
    focusPoint = {},
    fileNamePostfix;

  if (typeof crop === 'string') {
    newSizeValues = crop.split('x');
    fileNamePostfix = crop;
  } else if (crop.size) {
    newSizeValues = crop.size.split('x');
    fileNamePostfix = crop.size;

    if (crop.focusPoint) {
      focusPointCoordinates = crop.focusPoint.split(',');
      fileNamePostfix += '_' + crop.focusPoint;
    }
  }

  // if only one dimension is defined
  else {

    // if only width is defined
    if (crop.width || typeof crop === 'number') {
      if (crop.width) {
        newSizeValues[0] = crop.width;
      } else if (typeof crop === 'number') {
        newSizeValues[0] = crop;
      }

      newSizeValues[1] = Math.floor(originalSize.height * newSizeValues[0] / originalSize.width);
    }

    // if only height is defined
    else if (crop.height) {
      newSizeValues[1] = crop.height;
      newSizeValues[0] = Math.floor(originalSize.width * newSizeValues[1] / originalSize.height);
    }

    fileNamePostfix = newSizeValues[0] + 'x' + newSizeValues[1];
  }

  // setting focus point
  if (focusPointCoordinates.length > 0) {
    focusPoint = { width: focusPointCoordinates[0], height: focusPointCoordinates[1] };
  } else {
    // default focus point is image center
    focusPoint = {
      width: originalSize.width / 2,
      height: originalSize.height / 2
    };
  }

  return {
    focusPoint,
    fileNamePostfix,
    newSizeValues,
  };
};
