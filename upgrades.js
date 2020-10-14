var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.KewArCode'] = (function () {
  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       * Upgrade from 0.2.1
       * @param {object} parameters Parameters.
       * @param {function} finished Callback.
       * @param {object} extras Extras.
       */
      0: function (parameters, finished, extras) {
        finished(null, parameters, extras);
      }
    }
  };
})();
