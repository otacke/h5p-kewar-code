/** Class for utility functions */
export default class Util {
  /**
   * Extend an array just like JQuery's extend.
   * @param {object} arguments Objects to be merged.
   * @return {object} Merged objects.
   */
  static extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
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
   * Detect Internet Explorer.
   * @return {boolean} True, if browser is IE11, false otherwise
   */
  static isIE() {
    return (
      (navigator.appName === 'Microsoft Internet Explorer') ||
      (
        (navigator.appName === 'Netscape') &&
        (new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) != null)
      )
    );
  }
}
