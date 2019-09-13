/** Class representing the overlay */
export default class Overlay {
  /**
   * @constructor
   * @param {string} text Text.
   * @param {function} callback Callback when closed
   */
  constructor(text, callbackClosed) {
    callbackClosed = callbackClosed || (() => {});

    this.overlay = document.createElement('div');
    this.overlay.classList.add('h5p-kewar-code-overlay');
    this.overlay.classList.add('h5p-kewar-code-no-display');

    this.overlay.addEventListener('transitionend', () => {
      if (this.isTransparent === true) {
        this.overlay.classList.add('h5p-kewar-code-no-display');
      }
    });

    this.box = document.createElement('div');
    this.box.classList.add('h5p-kewar-code-overlay-box');
    this.box.innerHTML = text;
    this.overlay.appendChild(this.box);

    this.box.addEventListener('click', () => {
      this.hide();
      callbackClosed();
    });

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
   * Set text for the overlay.
   * @param {string} text Text for overlay.
   */
  setText(text = '') {
    this.box.innerHTML = text;
  }

  /**
   * Show overlay.
   * @param {string} text Text for overlay.
   */
  show(text) {
    this.isTransparent = false;

    if (typeof text !== 'undefined') {
      this.setText(text);
    }

    this.overlay.classList.remove('h5p-kewar-code-no-display');
    setTimeout( () => {
      this.overlay.classList.remove('h5p-kewar-code-no-opacity');
    }, 0);
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.isTransparent = true;
    this.overlay.classList.add('h5p-kewar-code-no-opacity');
  }
}
