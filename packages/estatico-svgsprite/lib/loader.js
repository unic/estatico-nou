/* globals document, XMLHttpRequest */
class SvgSpriteLoader {
  constructor(options) {
    this.config = Object.assign({
      // Class added to inserted sprites container
      containerClass: 'svgsprites',
      // Callback when sprite is loaded
      onLoaded: (name) => {
        document.documentElement.classList.add('svgsprites--loaded');
        document.documentElement.classList.add(`svgsprites--loaded-${name}`);
      },
      // Get sprites to load
      // Returns array of { name, url } objects
      getSprites: () => {
        try {
          const config = JSON.parse(document.body.dataset.svgspritesOptions);

          return config.map((url) => {
            const name = url.match(/([^/]*)\/*\.svg$/)[1];

            return {
              name,
              url,
            };
          });
        } catch (e) {
          return null;
        }
      },
    }, options);

    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    this.sprites = this.config.getSprites();

    if (!this.sprites) {
      return;
    }

    this.container = this.insertContainer();

    this.sprites.forEach((sprite) => {
      this.loadSprite(sprite);
    });
  }

  insertContainer() {
    const container = document.createElement('div');

    container.classList.add(this.config.containerClass);
    container.setAttribute('style', 'overflow:hidden;width:0;height:0;');

    document.body.appendChild(container);

    return container;
  }

  loadSprite(sprite) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', sprite.url, true);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.container.innerHTML += xhr.responseText;

        this.config.onLoaded(sprite.name);
      }
    };

    xhr.send();
  }
}

export default SvgSpriteLoader;
