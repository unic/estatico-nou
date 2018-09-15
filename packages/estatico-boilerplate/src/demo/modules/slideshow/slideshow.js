import $ from 'jquery';
import EstaticoModule from '../../../assets/js/helpers/module';
import MediaQuery from '../../../assets/js/helpers/mediaqueries';
import WindowEventListener from '../../../assets/js/helpers/events';
import namespace from '../../../assets/js/helpers/namespace';

const templates = {
  nav: require('./_slideshow_nav.js.hbs'), // eslint-disable-line global-require
  slide: require('./_slideshow_slide.js.hbs'), // eslint-disable-line global-require
};

class SlideShow extends EstaticoModule {
  constructor($element, data, options) {
    const defaultData = {
      i18n: {
        prev: 'Previous Slide',
        next: 'Next Slide',
      },
    };
    const defaultOptions = {
      initialItem: 0,
      animationDuration: 300,
      url: '/mocks/demo/modules/slideshow/slideshow.json?delay=5000',
      stateClasses: {
        activated: 'is_activated',
      },
      domSelectors: {
        slides: `[data-${SlideShow.name}="slides"]`,
        slide: `[data-${SlideShow.name}="slide"]`,
        nav: `[data-${SlideShow.name}="nav"]`,
        prev: `[data-${SlideShow.name}="prev"]`,
        next: `[data-${SlideShow.name}="next"]`,
      },
    };

    super($element, defaultData, defaultOptions, data, options);

    this.currentItem = -1;

    this.initUi();
    this.initEventListeners();
    this.fetchSlides();

    this.resize();
    this.show(this.options.initialItem);
  }

  static get events() {
    return {
      slide: `slide.${SlideShow.name}.${namespace}`,
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

    if (target >= this.ui.$slides.length) {
      target = 0;
    } else if (target < 0) {
      target = this.ui.$slides.length - 1;
    }

    this.ui.$slides.eq(this.currentItem).stop(true, true).slideUp(this.options.animationDuration);
    this.ui.$slides.eq(target).stop(true, true).slideDown(this.options.animationDuration);

    this.currentItem = target;

    this.ui.$element.trigger(SlideShow.events.slide, target);
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
    const slide = templates.slide(data);
    const $slide = $(slide);

    $slide.appendTo(this.ui.$wrapper);

    this.ui.$slides = this.ui.$slides.add($slide);
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
    this.ui.$wrapper = this.ui.$element.find(this.options.domSelectors.slides);
    this.ui.$slides = this.ui.$element.find(this.options.domSelectors.slide);
    this.ui.$nav = $(templates.nav(this.data));
    this.ui.$element.append(this.ui.$nav);
  }

  initEventListeners() {
    this.ui.$element
      .on(`click.${SlideShow.name}.${this.uuid}`, this.options.domSelectors.prev, (event) => {
        event.preventDefault();
        this.prev();
      })
      .on(`click.${SlideShow.name}.${this.uuid}`, this.options.domSelectors.next, (event) => {
        event.preventDefault();
        this.next();
      })
      .addClass(this.options.stateClasses.activated);

    // Exemplary touch detection
    if (Modernizr.touchevents) {
      this.log('Touch support detected');
    }

    // Exemplary debounced resize listener
    // (uuid used to make sure it can be unbound per plugin instance)
    WindowEventListener.addDebouncedResizeListener((originalEvent, event) => {
      this.log(event, originalEvent);
    }, this.uuid);

    // Exemplary debounced scroll listener
    // (uuid used to make sure it can be unbound per plugin instance)
    WindowEventListener.addThrottledScrollListener((originalEvent, event) => {
      this.log(event, originalEvent);
    }, this.uuid);

    // Exemplary media query listener
    // (uuid used to make sure it can be unbound per plugin instance)
    MediaQuery.addMQChangeListener(this.resize.bind(this), this.uuid);
  }

  fetchSlides() {
    // Exemplary AJAX request to mocked data with optional delay parameter
    // (works with local preview server only)
    $.ajax(this.options.url).done((response) => {
      // Loop through slides and add them
      if (response.slides) {
        response.slides.forEach((slide) => {
          this.add(slide);
        });
      }
    }).fail((jqXHR) => {
      this.log('NOO!', jqXHR.status, jqXHR.statusText);
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
    this.ui.$nav.remove();

    // Remove style definitions applied by $.slideUp / $.slideDown
    this.ui.$slides.removeAttr('style');
  }
}

export default SlideShow;
