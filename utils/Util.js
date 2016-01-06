var Util = {
  clone: function (object) {
    if (object === null || typeof object != 'object') {
      return object;
    }
    var copy = {};
    for (var attr in object) {
      if (object.hasOwnProperty(attr)) {
        copy[attr] = object[attr];
      }
    }
    return copy;
  },

  extend: function (object) {
    var sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(function (source) {
      if (Object.prototype.toString.call(source) !== '[object Object]') {
        return;
      }

      Object.keys(source).forEach(function (key) {
        object[key] = source[key];
      });
    });

    return object;
  },

  isFunction: function (value) {
    return (typeof value === 'object' || typeof value === 'function') &&
      Object.prototype.toString.call(value) === '[object Function]';
  }
}

module.exports = Util;
