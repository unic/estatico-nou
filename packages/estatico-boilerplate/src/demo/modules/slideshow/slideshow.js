import Module from '../../../assets/js/helpers/module';
import MediaQuery from '../../../assets/js/helpers/mediaqueries';
import WindowEventListener from '../../../assets/js/helpers/events';

const templates = {
  nav: require('./_slideshow_nav.js.hbs'), // eslint-disable-line global-require
  slide: require('./_slideshow_slide.js.hbs'), // eslint-disable-line global-require
};

class SlideShow extends Module {
  constructor(element, data, options) {
    const defaultData = {
      i18n: {
        prev: 'Previous Slide',
        next: 'Next Slide',
      },
    };
    const defaultOptions = {
      initialItem: 0,
      stateClasses: {
        isActivated: 'is-activated',
        isCurrent: 'is-current',
      },
      domSelectors: {
        slides: `[data-${SlideShow.name}="slides"]`,
        slide: `[data-${SlideShow.name}="slide"]`,
        nav: `[data-${SlideShow.name}="nav"]`,
        prev: `[data-${SlideShow.name}="prev"]`,
        next: `[data-${SlideShow.name}="next"]`,
      },
    };

    super(element, defaultData, defaultOptions, data, options);

    this.currentItem = -1;

    this.initUi();
    this.initEventListeners();

    if (this.options.url) {
      this.fetchSlides();
    }

    this.resize();
    this.show(this.options.initialItem);
  }

  static get events() {
    return {
      slide: 'slide',
    };
  }

  /**
   * Shows a specific slide according the given index.
   * @method
   * @public
   * @param {Number} index - The index of the slide to show as integer.
   */
  show(index) {
    let target = index;

    if (target === this.currentItem) {
      return;
    }

    if (target >= this.ui.slides.length) {
      target = 0;
    } else if (target < 0) {
      target = this.ui.slides.length - 1;
    }

    if (this.currentItem > -1) {
      this.ui.slides[this.currentItem].classList.remove(this.options.stateClasses.isCurrent);
    }
    this.ui.slides[target].classList.add(this.options.stateClasses.isCurrent);

    this.currentItem = target;

    this.ui.element.dispatchEvent(new CustomEvent(SlideShow.events.slide, {
      detail: {
        target,
      },
    }));
  }

  /**
   * Shows the previous slide in the slideshow.
   * @method
   * @public
   */
  prev() {
    this.show(this.currentItem - 1);
  }

  /**
   * Shows the next slide in the slideshow.
   * @method
   * @public
   */
  next() {
    this.show(this.currentItem + 1);
  }

  /**
   * Add slide.
   * @method
   * @public
   */
  add(data) {
    const slideTemplate = templates.slide(data);
    const slide = document.createRange().createContextualFragment(slideTemplate);

    this.ui.wrapper.appendChild(slide);

    this.ui.slides = this.ui.element.querySelectorAll(this.options.domSelectors.slide);
  }

  /**
   * Does things based on current viewport.
   * @method
   * @public
   */
  resize() {
    if (MediaQuery.query({ from: 'small' })) {
      this.log('Viewport: Above small breakpoint');
    } else {
      this.log('Viewport: Below small breakpoint');
    }
  }

  initUi() {
    const navTemplate = templates.nav(this.data);
    const nav = document.createRange().createContextualFragment(navTemplate);

    this.ui.element.appendChild(nav);

    this.ui.wrapper = this.ui.element.querySelector(this.options.domSelectors.slides);
    this.ui.slides = this.ui.element.querySelectorAll(this.options.domSelectors.slide);
    this.ui.nav = this.ui.element.querySelector(this.options.domSelectors.nav);
  }

  initEventListeners() {
    this.eventDelegate
      .on('click', this.options.domSelectors.prev, (event) => {
        event.preventDefault();
        this.prev();
      })
      .on('click', this.options.domSelectors.next, (event) => {
        event.preventDefault();
        this.next();
      });

    this.ui.element.classList.add(this.options.stateClasses.isActivated);

    // Exemplary touch detection
    if (Modernizr.touchevents) {
      this.log('Touch support detected');
    }

    // Exemplary debounced resize listener
    // (uuid used to make sure it can be unbound per plugin instance)
    WindowEventListener.addDebouncedResizeListener((event) => {
      this.log(event);
    }, this.uuid);

    // Exemplary debounced scroll listener
    // (uuid used to make sure it can be unbound per plugin instance)
    WindowEventListener.addThrottledScrollListener((event) => {
      this.log(event);
    }, this.uuid);

    // Exemplary media query listener
    // (uuid used to make sure it can be unbound per plugin instance)
    MediaQuery.addMQChangeListener(this.resize.bind(this), this.uuid);
  }

  async fetchSlides() {
    if (!window.fetch) {
      await import('whatwg-fetch');
    }
    // Exemplary AJAX request to mocked data with optional delay parameter
    // (works with local preview server only)
    return fetch(this.options.url)
      .then(response => response.json())
      .then((response) => {
        // Loop through slides and add them
        if (response.slides) {
          response.slides.forEach((slide) => {
            this.add(slide);
          });
        }
      })
      .catch((err) => {
        this.log('NOO!', err);
      });
  }

  /**
   * Unbind events, remove data, custom teardown
   * @method
   * @public
   */
  destroy() {
    super.destroy();

    // Remove custom DOM elements
    this.ui.nav.remove();

    // Remove classes
    this.ui.element.classList.remove(this.options.stateClasses.isActivated);

    // Remove custom events listeners
    WindowEventListener.removeDebouncedResizeListener(this.uuid);
    WindowEventListener.removeThrottledScrollListener(this.uuid);
    MediaQuery.removeMQChangeListener(this.uuid);
  }
}

export default SlideShow;
