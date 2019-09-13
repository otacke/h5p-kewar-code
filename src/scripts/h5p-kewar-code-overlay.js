/** Class representing the overlay */
export default class Overlay {
  /**
   * @constructor
   * @param {HTMLElement} content Content.
   * @param {function} callback Callback when closed
   */
  constructor(content, callbackClosed) {
    callbackClosed = callbackClosed || (() => {});

    this.overlay = document.createElement('div');
    this.overlay.classList.add('h5p-kewar-code-overlay');
    this.overlay.classList.add('h5p-kewar-code-no-display');

    this.overlay.addEventListener('transitionend', () => {
      if (this.isTransparent === true) {
        this.overlay.classList.add('h5p-kewar-code-no-display');
      }
    });

    const box = document.createElement('div');
    box.classList.add('h5p-kewar-code-overlay-box');
    this.overlay.appendChild(box);

    this.content = document.createElement('div');
    this.content.classList.add('h5p-kewar-code-overlay-box-content');
    if (content) {
      this.content.appendChild(content);
    }
    box.appendChild(this.content);

    const buttonClose = document.createElement('div');
    buttonClose.classList.add('h5p-kewar-code-overlay-box-button-close');
    buttonClose.addEventListener('click', () => {
      this.hide();
      callbackClosed();
    });
    box.appendChild(buttonClose);

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
   */
  show(content) {
    this.isTransparent = false;

    if (typeof text !== 'undefined') {
      this.setContent(content);
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
