var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.KewArCode'] = (function () {
  return {
    1: {
      /**
       * Turn H5P content into array of H5P contents.
       * @param {object} parameters Content parameters.
       * @param {function} finished Callback when finished.
       * @param {object} extras Extra parameters such as metadata, etc.
       */
      3: function (parameters, finished, extras) {
        if (parameters) {
          parameters.h5p = parameters.h5p ? [parameters.h5p] : [];
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
