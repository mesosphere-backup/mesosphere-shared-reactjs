jest.dontMock("../RequestUtil");
jest.dontMock("../Reqwest");

var RequestUtil = require("../RequestUtil");
var Reqwest = require("../Reqwest");

describe("RequestUtil", function () {

  describe('#debounceOnError', function () {
    var successFn;
    var errorFn;

    beforeEach(function () {
      successFn = jest.genMockFunction();
      errorFn = jest.genMockFunction();

      spyOn(RequestUtil, 'json').andCallFake(
        function (options) {
          // Trigger error for url 'failRequest'
          if (/failRequest/.test(options.url)) {
            options.error();
          }

          // Trigger success for url 'successRequest'
          if (/successRequest/.test(options.url)) {
            options.success();
          }

          return {};
        }
      );

      this.request = RequestUtil.debounceOnError(
        10,
        function (resolve, reject) {
          return function (url) {
            return RequestUtil.json({
              url: url,
              success: function () {
                successFn();
                resolve();
              },
              error: function () {
                errorFn();
                reject();
              }
            });
          };
        },
        {delayAfterCount: 5}
      );

    });

    it('should not debounce on the first 5 errors', function () {
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      expect(errorFn.mock.calls.length).toEqual(5);
    });

    it('should debounce on more than 5 errors', function () {
      // These will all be called
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      // These will all be debounced
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      expect(errorFn.mock.calls.length).toEqual(5);
    });

    it('should reset debouncing after success call', function () {
      // These will all be called
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('successRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      // This will be debounced
      this.request('failRequest');
      this.request('failRequest');
      expect(errorFn.mock.calls.length).toEqual(8);
      expect(successFn.mock.calls.length).toEqual(1);
    });

    it('should return the result of the function', function () {
      var result = this.request('successRequest');

      expect(typeof result).toEqual('object');
    });

  });

  describe('#getErrorFromXHR', function () {

    it('should return the description property', function () {
      var json = {responseJSON: {description: 'bar'}};
      expect(RequestUtil.getErrorFromXHR(json)).toEqual('bar');
    });

    it('should return the default error message when there is no description',
      function () {
        var json = {responseJSON: {foo: 'bar'}};
        expect(RequestUtil.getErrorFromXHR(json))
          .toEqual('An error has occurred.');
      });

  });

  describe("#json", function () {

    beforeEach(function () {
      spyOn(Reqwest, "reqwest");
    });

    it("Should not make a request before called", function () {
      expect(Reqwest.reqwest).not.toHaveBeenCalled();
    });

    it("Should try to make a request even if no args are provided", function () {
      RequestUtil.json();
      expect(Reqwest.reqwest).toHaveBeenCalled();
      expect(Reqwest.reqwest.mostRecentCall.args[0].url).toEqual(null);
    });

    it("Should use defaults for a GET json request", function () {
      RequestUtil.json({url: "foo?bar"});
      expect(Reqwest.reqwest).toHaveBeenCalled();
      expect(Reqwest.reqwest.mostRecentCall.args[0].url).toEqual("foo?bar");
      expect(Reqwest.reqwest.mostRecentCall.args[0].contentType).toEqual("application/json; charset=utf-8");
      expect(Reqwest.reqwest.mostRecentCall.args[0].type).toEqual("json");
      expect(Reqwest.reqwest.mostRecentCall.args[0].method).toEqual("GET");
    });

    it("Should override defaults with options given", function () {
      RequestUtil.json({method: "POST", contentType: "Yoghurt", type: "Bananas", timeout: 15});
      expect(Reqwest.reqwest).toHaveBeenCalled();
      expect(Reqwest.reqwest.mostRecentCall.args[0].contentType).toEqual("Yoghurt");
      expect(Reqwest.reqwest.mostRecentCall.args[0].type).toEqual("Bananas");
      expect(Reqwest.reqwest.mostRecentCall.args[0].timeout).toEqual(15);
      expect(Reqwest.reqwest.mostRecentCall.args[0].method).toEqual("POST");
    });

    it("Should return a request that is able to be aborted", function () {
      var prevAjax = Reqwest.reqwest;
      Reqwest.reqwest = function () {return {fakeProp: "faked"}; };

      var request = RequestUtil.json({url: "lolz"});
      expect(typeof request).toEqual("object");
      expect(request.fakeProp).toEqual("faked");

      Reqwest.reqwest = prevAjax;
    });

    it("Should return undefined if there is an ongoing request", function () {
      RequestUtil.json({url: "double"});
      var request = RequestUtil.json({url: "double"});

      expect(request).toEqual(undefined);
    });

    it("stringifies data when not doing a GET request", function () {
      RequestUtil.json({method: "PUT", data: {hello: "world"}});
      expect(Reqwest.reqwest.calls[0].args[0].data).toEqual("{\"hello\":\"world\"}");
    });

    it("does not stringify when request is of type GET", function () {
      RequestUtil.json({method: "GET", data: {hello: "world"}});
      expect(Reqwest.reqwest.calls[0].args[0].data).toEqual({hello: "world"});
    });

    it("does not set the datatype when doing a GET request", function () {
      RequestUtil.json({method: "GET", data: {hello: "world"}});
      expect(Reqwest.reqwest.calls[0].args[0].type).toEqual("json");
    });

    it("does not set the datatype if it's already set", function () {
      RequestUtil.json({method: "PUT", data: {hello: "world"}, type: "foo"});
      expect(Reqwest.reqwest.calls[0].args[0].type).toEqual("foo");
    });

    it("appends a timestamp to the end of the url", function () {
      RequestUtil.json({url: "foo"});
      expect(Reqwest.reqwest.calls[0].args[0].url).toMatch(/^foo\?_timestamp=[0-9]*$/);
    });

    it("does not append a timestamp to the end of the url if it already has a query param",
      function () {
      RequestUtil.json({url: "foo?bar"});
      expect(Reqwest.reqwest.calls[0].args[0].url).toEqual("foo?bar");
    });

  });

  describe("#parseResponseBody", function () {

    it("should parse the object with responseText correctly", function () {
      var originalObject = {name: "Kenny"};
      var xhr = {
        responseText: JSON.stringify(originalObject)
      };

      expect(RequestUtil.parseResponseBody(xhr)).toEqual(originalObject);
    });

    it("should parse the object with responseJSON correctly", function () {
      var originalObject = {name: "Kenny"};
      var xhr = {
        responseJSON: originalObject
      };

      expect(RequestUtil.parseResponseBody(xhr)).toEqual(originalObject);
    });

    it("should return empty object if responseText/responseJSON doesnt exist",
      function () {
        var originalObject = {status: 200};
        expect(RequestUtil.parseResponseBody(originalObject))
          .toEqual({});
      }
    );

  });

});
