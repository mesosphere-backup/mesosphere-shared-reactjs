jest.dontMock('../Util');

var Util = require('../Util');

describe('Util', function () {
  describe('#extend', function () {
    beforeEach(function () {
      this.originalObj = {
        a: 5,
        b: 10,
        c: 15
      };
    });

    it('should not change any properties if passed a single argument', function () {
      var newObj = Util.extend(this.originalObj);

      for (var key in this.originalObj) {
        expect(newObj[key]).toEqual(this.originalObj[key]);
      }
    });

    it('should combine properties with the source', function () {
      var source = {
        a: 'changed prop'
      };

      var newObj = Util.extend(this.originalObj, source);
      expect(newObj.a).toEqual('changed prop');
    });

    it('should handle multiple arguments', function () {
      var obj1 = {
        a: 'changed prop',
        b: 'changed prop'
      };

      var obj2 = {
        a: 'overrode prop'
      };

      var newObj = Util.extend(this.originalObj, obj1, obj2);
      expect(newObj.a).toEqual('overrode prop');
      expect(newObj.b).toEqual('changed prop');
    });

    it('should not do anything if not passed an obj', function () {
      var string = 'string';
      var func = function () {};
      func.fakeProp = 'faked prop';
      var nullVal = null;

      var newObj = Util.extend(this.originalObj, string, func, nullVal);

      for (var key in newObj) {
        expect(newObj[key]).toEqual(this.originalObj[key]);
      }
    });
  });

  describe('#isArrayLike', function () {
    it('should be truthy when given an array', function () {
      var array = [0, 1, 2, 3];
      expect(Util.isArrayLike(array)).toBeTruthy();
    });

    it('should be falsy when given an integer', function () {
      var integer = 3;
      expect(Util.isArrayLike(integer)).toBeFalsy();
    });
  });

  describe('#isLength', function () {
    it('should be truthy when given a positive integer less than 9007199254740991', function () {
      var integer = 500;
      expect(Util.isLength(integer)).toBeTruthy();
    });

    it('should be falsy when given a negative integer', function () {
      var integer = -3;
      expect(Util.isLength(integer)).toBeFalsy();
    });

    it('should be falsy when given an integer greater than 9007199254740991', function () {
      var integer = 9007199254740992;
      expect(Util.isLength(integer)).toBeFalsy();
    });
  });

  describe('#isObject', function () {
    it('should be truthy when given an object', function () {
      var object = {foo: 'bar'};
      expect(Util.isObject(object)).toBeTruthy();
    });

    it('should be falsy when given a string', function () {
      var object = 'foo';
      expect(Util.isObject(object)).toBeFalsy();
    });

    it('should be falsy when given an integer', function () {
      var integer = 500;
      expect(Util.isObject(integer)).toBeFalsy();
    });
  });
});
