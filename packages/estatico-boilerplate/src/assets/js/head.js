import loadSvgSprites from '@unic/estatico-svgsprite/lib/loader';
import './helpers/modernizrrc';
import FontLoader from './helpers/fontloader';
import Helper from './helpers/helper';

window.estatico = {
  data: {}, // Content data
  options: {}, // Module options
  fontLoader: new FontLoader(),
  helpers: new Helper(),
};

document.addEventListener('DOMContentLoaded', loadSvgSprites());
