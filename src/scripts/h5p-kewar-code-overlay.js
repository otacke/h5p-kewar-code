import FocusTrap from '@services/focus-trap.js';
import Util from '@services/util.js';

/** @constant {number} SLACK Slack for width. */
const SLACK = 5;

/** Class representing the overlay */
export default class Overlay {
  /**
   * @class
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

    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);

    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', this.params.a11y.codeContents);
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

    this.boxInner = document.createElement('div');
    this.boxInner.classList.add('h5p-kewar-code-overlay-box-inner');
    this.boxOuter.appendChild(this.boxInner);

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
      if (event.key === 'Enter' || event.key === ' ') {
        this.handleClosed();
      }
    });
    this.boxInner.appendChild(this.buttonClose);

    // Content (made 1st element by flex-direction for a11y)
    this.content = document.createElement('div');
    this.content.classList.add('h5p-kewar-code-overlay-box-content');
    if (this.params.content) {
      this.content.appendChild(this.params.content);
    }
    this.boxInner.appendChild(this.content);

    this.focusTrap = new FocusTrap({ trapElement: this.overlay });

    this.hide();
  }

  /**
   * Return the DOM for the overlay.
   * @returns {HTMLElement} DOM for overlay.
   */
  getDOM() {
    return this.overlay;
  }

  /**
   * Get height of the overlay box.
   * @returns {number} Height of the overlay box.
   */
  getBoxHeight() {
    const styles = window.getComputedStyle(this.boxOuter);
    const paddingTop = parseInt(styles.getPropertyValue('padding-top'), 10);
    const paddingBottom = parseInt(styles.getPropertyValue('padding-bottom'), 10);

    return this.boxInner.offsetHeight + paddingTop + paddingBottom;
  }

  /**
   * Set content for the overlay.
   * @param {string} content Text for overlay.
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

    // Wait to allow DOM to progress
    window.requestAnimationFrame(() => {
      this.focusTrap.activate();
      this.overlay.addEventListener('click', this.handleGlobalClick);
      this.overlay.addEventListener('keyup', this.handleKeyup);
    });
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.isTransparent = true;
    this.overlay.classList.add('h5p-kewar-code-no-opacity');

    this.overlay.removeEventListener('click', this.handleGlobalClick);
    this.overlay.removeEventListener('keyup', this.handleKeyup);

    this.focusTrap.deactivate();
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
   * Handle global click event.
   * @param {Event} event Click event.
   */
  handleGlobalClick(event) {
    if (
      !this.boxOuter.contains(event.target) &&
      event.target.isConnected // H5P content may have removed element already
    ) {
      this.handleClosed();
    }
  }

  /**
   * Handle keyboard event.
   * @param {KeyboardEvent} event Keyboard event.
   */
  handleKeyup(event) {
    if (event.key === 'Escape') {
      this.handleClosed();
    }
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
    const rowWidest = [].slice.call(this.content.querySelectorAll('.h5p-kewar-code-display-row-name'))
      .reduce((accu, field) => {
        return Math.max(accu, field.offsetWidth || 0);
      }, 0);

    if (rowWidest === 0) {
      return;
    }

    const rowMaxWidth = rowWidest + SLACK;
    // eslint-disable-next-line no-magic-numbers
    const rowWidth = 100 * rowMaxWidth / this.content.offsetWidth;

    [].slice.call(this.content.querySelectorAll('.h5p-kewar-code-display-row-name'))
      .forEach((name) => {
        name.style.flexGrow = 1;
        name.style.flexShrink = 1;
        name.style.maxWidth = `${rowMaxWidth}px`;
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';
        name.style.width = `${rowWidth}%`;
      });

    [].slice.call(this.content.querySelectorAll('.h5p-kewar-code-display-row-content'))
      .forEach((name) => {
        name.style.flexGrow = 1;
        // eslint-disable-next-line no-magic-numbers
        name.style.width = `${100 - rowWidth}%`;
      });
  }
}
