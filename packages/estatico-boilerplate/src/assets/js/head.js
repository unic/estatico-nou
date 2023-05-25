import SvgSpriteLoader from '@unic/estatico-svgsprite/lib/loader';
import './helpers/modernizrrc';
import FontLoader from './helpers/fontloader';
import Helper from './helpers/helper';
import namespace from './helpers/namespace';

window[namespace] = {
  data: {}, // Content data
  options: {}, // Module options
  fontLoader: new FontLoader(),
  svgSpriteLoader: new SvgSpriteLoader(),
  helpers: new Helper(),
};
