jest.dontMock("../RequestUtil");
jest.dontMock("../Reqwest");

var RequestUtil = require("../RequestUtil");
var Reqwest = require("../Reqwest");

describe("RequestUtil", function () {

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
      RequestUtil.json({url: "lol"});
      expect(Reqwest.reqwest).toHaveBeenCalled();
      expect(Reqwest.reqwest.mostRecentCall.args[0].url).toEqual("lol");
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

    it("sets the correct datatype when doing a PUT request", function () {
      RequestUtil.json({method: "PUT", data: {hello: "world"}});
      expect(Reqwest.reqwest.calls[0].args[0].type).toEqual("text");
    });

    it("does not set the datatype when doing a GET request", function () {
      RequestUtil.json({method: "GET", data: {hello: "world"}});
      expect(Reqwest.reqwest.calls[0].args[0].type).toEqual("json");
    });

    it("does not set the datatype if it's already set", function () {
      RequestUtil.json({method: "PUT", data: {hello: "world"}, type: "foo"});
      expect(Reqwest.reqwest.calls[0].args[0].type).toEqual("foo");
    });

  });
});
