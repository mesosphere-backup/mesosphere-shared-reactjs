function es6ify(mixin) {
  if (typeof mixin === "function") {
    // mixin is already es6 style
    return mixin;
  }

  return function (Base) {
    // mixin is old-react style plain object
    // convert to ES6 class
    function MixinClass() {}
    MixinClass.prototype = Object.create(Base.prototype);
    MixinClass.prototype.constructor = MixinClass;
    Object.assign(MixinClass.prototype, mixin);

    return MixinClass;
  };
}

function mixin() {
  var mixins = Array.prototype.slice.call(arguments);

  // Creates base class
  function Base() {}

  mixins.reverse();

  mixins.forEach(function (mixin) {
    Base = es6ify(mixin)(Base);
  });

  return Base;
}

module.exports = {
  mixin
};
