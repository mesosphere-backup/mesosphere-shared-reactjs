jest.dontMock('../StoreMixin');
jest.dontMock('../../utils/Store');
jest.dontMock('../../utils/Util');
jest.dontMock('../../utils/StringUtil');

var mixin = require('reactjs-mixin');

var Store = require('../../utils/Store');
var StoreMixin = require('../StoreMixin');
var Util = require('../../utils/Util');

var marathonSuccess = "MARATHON_SUCCESS";
var marathonError = "MARATHON_ERROR";

var MarathonStore;

describe('StoreMixin', function () {
  beforeEach(function () {
    MarathonStore = Store.createStore({
      storeID: 'marathon',
      addChangeListener: function () {},
      removeChangeListener: function () {}
    });

    StoreMixin.store_configure({
      marathon: {
        store: MarathonStore,
        events: {
          success: marathonSuccess,
          error: marathonError
        },
        unmountWhen: function () {
          return true;
        },
        listenAlways: true
      }
    });

    var Base = mixin(StoreMixin);

    function MyClass() {}
    MyClass.prototype = Object.create(Base.prototype);
    MyClass.prototype.forceUpdate = function () {};
    MyClass.prototype.constructor = MyClass;

    this.instance = new MyClass();
    spyOn(MarathonStore, 'addChangeListener');
    spyOn(MarathonStore, 'removeChangeListener');
  });

  describe('#componentDidMount', function () {

    it('does not create any store listeners', function () {
      this.instance.componentDidMount();
      expect(this.instance.store_listeners).toEqual(undefined);
    });

    it('should create an object for store_listeners', function () {
      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();

      expect(Object.keys(this.instance.store_listeners)).toEqual(['marathon']);
    });

    it('sets up each store listener with a configuration', function () {
      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();

      var type = typeof this.instance.store_listeners.marathon;
      expect(type).toEqual('object');
    });

    it('merges custom configuration', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        listenAlways: false
      }];
      this.instance.componentDidMount();

      expect(this.instance.store_listeners.marathon.listenAlways).toBeFalsy();
    });

    it('starts listening for store changes', function () {
      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();
      // 2 because of success/error events
      expect(MarathonStore.addChangeListener.calls.length).toEqual(2);
    });

    it('calls the event listener with the configured event', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        events: ['success']
      }];
      this.instance.componentDidMount();

      expect(MarathonStore.addChangeListener.calls.length).toEqual(1);
      expect(MarathonStore.addChangeListener).toHaveBeenCalledWith(
        marathonSuccess, jasmine.any(Function)
      );
    });

  });

  describe('#store_addListeners', function () {

    it('doesn"t create new listeners when they already exist', function () {
      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();
      this.instance.store_addListeners();
      // 2 because of success/error events
      expect(MarathonStore.addChangeListener.calls.length).toEqual(2);
    });

  });

  describe('#store_removeListeners', function () {

    it('it won"t try to remove listeners that are not setup', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        events: ['success']
      }];
      this.instance.componentDidMount();
      // Multiple calls
      this.instance.store_removeListeners();
      this.instance.store_removeListeners();

      expect(MarathonStore.removeChangeListener.calls.length).toEqual(1);
    });

  });

  describe('#componentWillUnmount', function () {

    it('removes listeners from store', function () {
      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();
      this.instance.componentWillUnmount();
      // 2 because of success/error events
      expect(MarathonStore.removeChangeListener.calls.length).toEqual(2);
    });

    it('removes event listeners for configured event', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        events: ['success']
      }];
      this.instance.componentDidMount();
      this.instance.componentWillUnmount();

      expect(MarathonStore.removeChangeListener.calls.length).toEqual(1);
      expect(MarathonStore.removeChangeListener)
        .toHaveBeenCalledWith(marathonSuccess, function () {});
    });

  });

  describe('#store_onStoreChange', function () {

    it('calls unmountWhen', function () {
      var fn = jasmine.createSpy('unmountWhen');
      this.instance.store_listeners = [{
        name: 'marathon',
        unmountWhen: fn,
        listenAlways: false
      }];
      this.instance.componentDidMount();
      this.instance.store_onStoreChange('marathon', 'success');

      expect(fn).toHaveBeenCalled();
    });

    it('calls unmountWhen with the correct storeID and event', function () {
      var fn = jasmine.createSpy('unmountWhen');
      this.instance.store_listeners = [{
        name: 'marathon',
        unmountWhen: fn,
        listenAlways: false
      }];
      this.instance.componentDidMount();
      this.instance.store_onStoreChange('marathon', 'success');

      expect(fn.calls[0].args[0]).toEqual(jasmine.any(Object));
      expect(fn.calls[0].args[1]).toEqual('success');
    });

    it('removes listener when unmountWhen is truthy', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        unmountWhen: function () { return true; },
        listenAlways: false
      }];
      this.instance.componentDidMount();
      this.instance.store_onStoreChange('marathon', 'success');

      expect(MarathonStore.removeChangeListener).toHaveBeenCalled();
    });

    it('doesn"t remove listener when unmountWhen is falsy', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        unmountWhen: function () { return false; },
        listenAlways: false
      }];
      this.instance.componentDidMount();
      this.instance.store_onStoreChange('marathon', 'success');

      expect(MarathonStore.removeChangeListener).not.toHaveBeenCalled();
    });

    it('doesn"t remove listener when listenAlways is truthy', function () {
      this.instance.store_listeners = [{
        name: 'marathon',
        unmountWhen: function () { return true; },
        listenAlways: true
      }];
      this.instance.componentDidMount();
      this.instance.store_onStoreChange('marathon', 'success');

      expect(MarathonStore.removeChangeListener).not.toHaveBeenCalled();
    });

    it('doesn"t remove listener when listenAlways is truthy', function () {
      var onMarathonStoreSuccess = jasmine.createSpy('onMarathonStoreSuccess');

      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();
      this.instance.onMarathonStoreSuccess = onMarathonStoreSuccess;
      this.instance.store_onStoreChange('marathon', 'success');

      expect(onMarathonStoreSuccess).toHaveBeenCalled();
    });

    it('calls listener with passed arguments', function () {
      var onMarathonStoreSuccess = jasmine.createSpy('onMarathonStoreSuccess');

      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();
      this.instance.onMarathonStoreSuccess = onMarathonStoreSuccess;
      this.instance.store_onStoreChange('marathon', 'success', 1, 2, 3, 4);

      expect(onMarathonStoreSuccess.calls[0].args).toEqual([1, 2, 3, 4]);
    });

    it('calls #forceUpdate on store change', function () {
      this.instance.store_listeners = ['marathon'];
      this.instance.componentDidMount();
      spyOn(this.instance, 'forceUpdate');
      this.instance.store_onStoreChange('marathon', 'success');

      expect(this.instance.forceUpdate).toHaveBeenCalled();
    });

  });

});
