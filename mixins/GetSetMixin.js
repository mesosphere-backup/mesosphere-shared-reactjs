/**
 * A mixin to create getter and setter functions for store data
 */

var Util = require('../utils/Util.js');

var GetSetMixin = {

  get: function (key) {
    if (typeof this.getSet_data === 'undefined') {
      return null;
    }

    return this.getSet_data[key];
  },

  getAll: function () {
    if (typeof this.getSet_data === 'undefined') {
      return null;
    }

    return this.getSet_data;
  },

  set: function (data) {
    if (!Util.isObject(data) || Util.isArrayLike(data)) {
      throw new Error('Can only update getSet_data with data of type Object.');
    }

    // Allows overriding `getSet_data` wherever this is implemented
    if (typeof this.getSet_data === 'undefined') {
      this.getSet_data = {};
    }

    Util.extend(this.getSet_data, data);
  }

};

module.exports = GetSetMixin;
