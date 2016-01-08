var EventEmitter = require('events').EventEmitter;

jest.dontMock('../Store');
jest.dontMock('../Util');

var Store = require('../../utils/Store');

describe('Store', function () {

  describe('#createStore', function () {

    beforeEach(function () {
      this.emitterProps = Object.keys(EventEmitter.prototype);
    });

    it('should bind mixin function properties to store context', function () {
      function someFunction() {
        return this.foo;
      }

      var newStore = Store.createStore({
        storeID: 'foo',
        mixins: [{someFunction: someFunction, foo: true}]
      });
      expect(newStore.someFunction()).toEqual(true);
    });

    it('should clone mixin non-function properties to store context', function () {
      var someObject = {
        someValue: 'someValue'
      };
      var newStore = Store.createStore({
        storeID: 'foo',
        mixins: [{someObject: someObject}]
      });

      someObject.someValue = 'otherValue';
      expect(newStore.someObject.someValue).toEqual('someValue');
    });

    it('should not deeply clone non-function properties', function () {
      var someObject = {
        someValue: function () {}
      };
      var newStore = Store.createStore({
        storeID: 'foo',
        mixins: [{someObject: someObject}]
      });

      expect(newStore.someObject.someValue).toEqual(someObject.someValue);
    });

    it('doesn\'t allow creating a store without storeID', function () {
      expect(Store.createStore).toThrow();
    });

    it('creates a store without mixins', function () {
      var emitterProps = this.emitterProps;
      var newStore = Store.createStore({storeID: 'foo'});
      var props = Object.keys(newStore);
      props.map(function (key, index) {
        var value = emitterProps[index];
        if (key === 'storeID') {
          value = 'storeID';
        }

        expect(key).toEqual(value);
      });
    });

    it('creates a store with 1 mixin', function () {
      var emitterProps = this.emitterProps;
      var newStore = Store.createStore({
        storeID: 'foo',
        mixins: [{someProperty: 'someValue'}]
      });

      Object.keys(newStore).map(function (key, index) {
        if (emitterProps[index] == null && key !== 'storeID') {
          expect(key === 'someProperty' || key === 'mixins').toEqual(true);
        }
      });
    });

    it('creates a store with multiple mixins', function () {
      var newStore = Store.createStore({
        storeID: 'foo',
        mixins: [
          {someProperty: 'someValue'},
          {anotherProperty: 'anotherValue'}
        ]
      });

      expect(newStore.someProperty).toEqual('someValue');
      expect(newStore.anotherProperty).toEqual('anotherValue');
    });

    it('should let mixins take preceedence over store', function () {
      var newStore = Store.createStore({
        storeID: 'foo',
        someProperty: 'someValue',
        mixins: [{someProperty: 'anotherValue'}]
      });

      expect(newStore.someProperty).toEqual('anotherValue');
    });

    it('should let mixins take preceedence over EventEmitter', function () {
      var newStore = Store.createStore({
        storeID: 'foo',
        mixins: [{emit: 'someValue'}]
      });

      expect(newStore.emit).toEqual('someValue');
    });

  });

});
