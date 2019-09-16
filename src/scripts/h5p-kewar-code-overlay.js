import Util from "../scripts/h5p-kewar-code-util";

/** Class representing the overlay */
export default class Overlay {
  /**
   * @constructor
   * @param {object} params Parameters.
   * @param {HTMLElement} params.content Content.
   * @param {function} params.callback Callback when closed
   * @param {object} params.a11y Accessibility texts.
   * @param {string} params.a11y.closeCodeInformation Close information text.
   */
  constructor(params) {
    this.params = Util.extend({
      callbackClosed: () => {},
      a11y: {
        closeCodeInformation: 'Close information.'
      }
    }, params);

    this.closeButtonHasFocus = false;

    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.classList.add('h5p-kewar-code-overlay');
    this.overlay.classList.add('h5p-kewar-code-no-display');
    this.overlay.addEventListener('transitionend', () => {
      if (this.isTransparent === true) {
        this.overlay.classList.add('h5p-kewar-code-no-display');
      }
    });

    // Box containing content and close button
    const box = document.createElement('div');
    box.classList.add('h5p-kewar-code-overlay-box');
    this.overlay.appendChild(box);

    // Close button (made 2nd element by flex-direction for a11y)
    this.buttonClose = document.createElement('div');
    this.buttonClose.classList.add('h5p-kewar-code-overlay-box-button-close');
    this.buttonClose.setAttribute('role', 'button');
    this.buttonClose.setAttribute('tabindex', 0);
    this.buttonClose.setAttribute('aria-label', this.params.a11y.closeCodeInformation);
    this.buttonClose.addEventListener('click', () => {
      this.handleClosed();
    });
    this.buttonClose.addEventListener('keydown', (event) => {
      event = event || window.event;
      const key = event.which || event.keyCode;
      if (key === 13 || key === 32) {
        this.handleClosed();
      }
    });
    box.appendChild(this.buttonClose);

    // Content (made 1st element by flex-direction for a11y)
    this.content = document.createElement('div');
    this.content.classList.add('h5p-kewar-code-overlay-box-content');
    if (this.params.content) {
      this.content.appendChild(this.params.content);
    }
    box.appendChild(this.content);

    this.hide();
  }

  /**
   * Return the DOM for the overlay.
   * @return {HTMLElement} DOM for overlay.
   */
  getDOM() {
    return this.overlay;
  }

  /**
   * Set content for the overlay.
   * @param {string} text Text for overlay.
   */
  setContent(content) {
    if (!content) {
      return;
    }
    this.content.innerHTML = '';
    this.content.appendChild(content);
  }

  /**
   * Show overlay.
   * @param {HTMLElement} content Element for overlay.
   * @param {boolean} focus If true, closeButton will get focus.
   */
  show(content, focus) {
    this.isTransparent = false;

    if (typeof content !== 'undefined') {
      this.setContent(content);
    }

    this.overlay.classList.remove('h5p-kewar-code-no-display');
    setTimeout( () => {
      this.overlay.classList.remove('h5p-kewar-code-no-opacity');
    }, 0);

    if (focus) {
      this.closeButtonHasFocus = true;
      this.buttonClose.focus();
    }
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.isTransparent = true;
    this.overlay.classList.add('h5p-kewar-code-no-opacity');
  }

  /**
   * Handle closing the overlay.
   */
  handleClosed() {
    this.hide();
    this.params.callbackClosed(this.closeButtonHasFocus);
    this.closeButtonHasFocus = false;
  }
}
