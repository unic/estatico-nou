/* eslint-disable no-var,vars-on-top,prefer-arrow-callback,func-names,prefer-template */
/* globals document, window, ActiveXObject */

/**
 * SVG Icon Sprite Loader
 *
 * @author Unic AG
 * @copyright Unic AG
 */

function loadSvgSprites() {
  var id = 'm-svgsprites';
  var spriteContainer = document.createElement('div');
  var spritesToLoad;
  var spritesAmount;

  setTimeout(function () {
    spritesToLoad = JSON.parse(document.body.getAttribute('data-svgsprites-options'));
    spritesAmount = spritesToLoad.length;

    /**
     * Check if we can send a XMLHttpRequest
     * @returns {*}
     */
    function getXMLHttpRequest() {
      if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest();
      }
      try {
        return new ActiveXObject('MSXML2.XMLHTTP.3.0');
      } catch (e) {
        return null;
      }
    }

    /**
     * RequestSVG
     * @param url - string holding the url to the svg file
     * @constructor
     */
    function RequestSVG(url) {
      var oReq = getXMLHttpRequest();
      var container = document.getElementById(id);
      var handler = function () {
        if (oReq.readyState === 4) { // complete
          if (oReq.status === 200) {
            container.innerHTML += oReq.responseText;
          }
        }
      };

      oReq.open('GET', url, true);
      oReq.onreadystatechange = handler;
      oReq.send();
    }

    /**
     * Send getXMLHttpRequest for each SVG sprite reference
     * found in the data-icon-sets attribute on the body tag
     */
    if (spritesAmount > 0 && (document.getElementById(id) === null)) {
      var i = spritesAmount;
      var html = document.getElementsByTagName('html')[0];

      if (getXMLHttpRequest() !== null) {
        spriteContainer.setAttribute('id', id);
        spriteContainer.setAttribute('data-svgsprites', 'wrapper'); // for potential later usage within JavaScript
        spriteContainer.setAttribute('style', 'display: none');

        document.body.appendChild(spriteContainer);

        while (i--) { // eslint-disable-line no-plusplus
          new RequestSVG(spritesToLoad[i]); // eslint-disable-line no-new
        }

        html.setAttribute('class', html.getAttribute('class') + ' svgSpritesLoaded'); // word of caution: the SVG files might not really be loaded yet, this is rather about having them requested (for now)
      }
    }
  }, 100);
}

export default loadSvgSprites;
