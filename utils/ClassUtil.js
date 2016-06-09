// Babel inherits function
function inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (superClass) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(subClass, superClass);
    } else {
      subClass.__proto__ = superClass;
    }
  }
}

function es6ify(Base, mixin) {
  // mixin is old-react style plain object
  // convert to ES6 class
  function MixinClass() {}
  MixinClass.prototype = Object.create(Base.prototype);
  MixinClass.prototype.constructor = MixinClass;
  Object.assign(MixinClass.prototype, mixin);

  return MixinClass;
}

function mixin(Parent /*, ...mixins*/) {
  var mixins = Array.prototype.slice.call(arguments, 1);
  // Creates base class
  function Base() {}
  mixins.reverse();

  if (typeof Parent === 'function') {
    // Make Base inherit from Parent, if Parent is a class
    inherits(Base, Parent);
  } else {
    // Parent is a regular object, let's add it to mixins
    mixins.push(Parent);
  }

  mixins.forEach(function (mixin) {
    Base = es6ify(Base, mixin);
  });

  return Base;
}

module.exports = {
  mixin: mixin
};
