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

    // Will be triggered when the overlay has fully disappeared
    this.overlay.addEventListener('transitionend', () => {
      if (this.isTransparent === true) {
        this.overlay.classList.add('h5p-kewar-code-no-display');

        setTimeout(() => {
          this.params.callbackClosed(this.closeButtonHasFocus);
        }, 0);
      }
    });

    // Box containing content and close button
    this.boxOuter = document.createElement('div');
    this.boxOuter.classList.add('h5p-kewar-code-overlay-box-outer');
    this.overlay.appendChild(this.boxOuter);

    const boxInner = document.createElement('div');
    boxInner.classList.add('h5p-kewar-code-overlay-box-inner');
    this.boxOuter.appendChild(boxInner);

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
    boxInner.appendChild(this.buttonClose);

    // Content (made 1st element by flex-direction for a11y)
    this.content = document.createElement('div');
    this.content.classList.add('h5p-kewar-code-overlay-box-content');
    if (this.params.content) {
      this.content.appendChild(this.params.content);
    }
    boxInner.appendChild(this.content);

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
   * Get height of the overlay box.
   * @return {number} Height of the overlay box.
   */
  getBoxHeight() {
    return this.boxOuter.offsetHeight;
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
      this.setColumnWidths();
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
    this.closeButtonHasFocus = false;

    // Close-Callback will be triggered by event listener after animation ended
  }

  /**
   * Set width of content columns.
   */
  setColumnWidths() {
    /*
     * CSS gives prority to let name fields have full witdh initially and uses
     * the longest name field for future reference, so all fields keep the same
     * width.
     */
    const rowWidest = [...this.content.querySelectorAll('.h5p-kewar-code-display-row-name')].reduce((accu, field) => {
      return Math.max(accu, field.offsetWidth || 0);
    }, 0);

    if (rowWidest === 0) {
      return;
    }

    const rowMaxWidth = rowWidest + 5;
    const rowWidth = 100 * rowMaxWidth / this.content.offsetWidth;

    this.content.querySelectorAll('.h5p-kewar-code-display-row-name').forEach((name) => {
      name.style.flexGrow = 1;
      name.style.flexShrink = 1;
      name.style.maxWidth = `${rowMaxWidth}px`;
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.style.width = `${rowWidth}%`;
    });

    this.content.querySelectorAll('.h5p-kewar-code-display-row-content').forEach((name) => {
      name.style.flexGrow = 1;
      name.style.width = `${100 - rowWidth}%`;
    });
  }
}
