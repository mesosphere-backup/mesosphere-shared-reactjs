var Util = require('./Util');
var EventEmitter = require('events').EventEmitter;

function mixInto(target, source) {
  Object.keys(source).forEach(function (key) {

    var toCopy = source[key];
    if (Util.isFunction(toCopy)) {
      // Bind the function from the source to target and assign it to the target
      target[key] = toCopy.bind(target);
    } else {
      // Clone any objects, arrays or properties
      target[key] = Util.clone(toCopy);
    }
  });
}

var Store = {
  createStore: function (store) {
    store = store || {};
    if (store.storeID == null) {
      throw 'All stores must have an id!';
    }

    var mixins = store.mixins || [];
    mixins.forEach(function (mixin) {
      mixInto(store, mixin);
    });

    return Util.extend({}, EventEmitter.prototype, store);
  }
};

module.exports = Store;
