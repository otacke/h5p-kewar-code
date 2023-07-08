/** Class for utility functions */
export default class Util {
  /**
   * Extend an array just like JQuery's extend.
   * @returns {object} Merged objects.
   */
  static extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }

  /**
   * Retrieve true string from HTML encoded string.
   * @param {string} input Input string.
   * @returns {string} Output string.
   */
  static htmlDecode(input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  }

  /**
   * Retrieve object with true strings from HTML encoded strings.
   * @param {object|string|number} elements Elements to decode.
   * @returns {object|string|number} Output elements.
   */
  static htmlDecodeDeep(elements) {
    if (typeof elements === 'string') {
      return Util.htmlDecode(elements);
    }
    else if (typeof elements === 'object') {
      for (let element in elements) {
        elements[element] = Util.htmlDecodeDeep(elements[element]);
      }
      return elements;
    }
    else {
      return elements;
    }
  }

  /**
   * Retrieve string without HTML tags.
   * @param {string} html Input string.
   * @returns {string} Output string.
   */
  static stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Retrieve object without HTML in strings.
   * @param {object|string|number} elements Elements to strip HTML from.
   * @returns {object|string|number} Output elements.
   */
  static stripHTMLDeep(elements) {
    if (typeof elements === 'object') {
      for (let element in elements) {
        elements[element] = Util.stripHTMLDeep(elements[element]);
      }
      return elements;
    }
    else if (typeof elements === 'string') {
      return Util.stripHTML(elements);
    }
    else {
      return elements;
    }
  }
}
