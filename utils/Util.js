var MAX_SAFE_INTEGER = 9007199254740991;

function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

var getLength = baseProperty('length');

var Util = {
  clone: function (object) {
    if (object === null || typeof object != 'object') {
      return object;
    }
    var copy = {};
    for (var attr in object) {
      if (Object.prototype.hasOwnProperty.call(object, attr)) {
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

  isArrayLike: function (value) {
    return value != null &&
      !(typeof value == 'function' && Util.isFunction(value)) && Util.isLength(getLength(value));
  },

  isFunction: function (value) {
    return (typeof value === 'object' || typeof value === 'function') &&
      Object.prototype.toString.call(value) === '[object Function]';
  },

  isLength: function (value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 &&
      value <= MAX_SAFE_INTEGER;
  },

  isObject: function (value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }
}

module.exports = Util;
