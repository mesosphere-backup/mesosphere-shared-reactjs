var Reqwest = require("./Reqwest");
var Util = require("./Util");

var DEFAULT_ERROR_MESSAGE = "An error has occurred.";

var activeRequests = {};

function createCallbackWrapper(callback, requestID) {
  return function () {
    setRequestState(requestID, false);

    if (Util.isFunction(callback)) {
      callback.apply(null, arguments);
    }
  };
}

function isRequestActive(requestID) {
  return activeRequests.hasOwnProperty(requestID) &&
    activeRequests[requestID] === true;
}

function setRequestState(requestID, state) {
  activeRequests[requestID] = state;
}

var RequestUtil = {
  debounceOnError: function (interval, promiseFn, options) {
    var rejectionCount = 0;
    var timeUntilNextCall = 0;
    var currentInterval = interval;
    options = options || {};

    if (typeof options.delayAfterCount !== "number") {
      options.delayAfterCount = 0;
    }

    function resolveFn() {
      rejectionCount = 0;
      timeUntilNextCall = 0;
      currentInterval = interval;
    }

    function rejectFn() {
      rejectionCount++;

      // Only delay if after delayAfterCount requests have failed
      if (rejectionCount >= options.delayAfterCount) {
        // Exponentially increase the time till the next call
        currentInterval *= 2;
        timeUntilNextCall = Date.now() + currentInterval;
      }
    }

    var callback = promiseFn(resolveFn, rejectFn);

    return function () {
      if (Date.now() < timeUntilNextCall) {
        return;
      }

      /* eslint-disable consistent-return */
      return callback.apply(options.context, arguments);
      /* eslint-enable consistent-return */
    };
  },

  getErrorFromXHR: function (xhr) {
    var response = this.parseResponseBody(xhr);
    return response.description || response.message || DEFAULT_ERROR_MESSAGE;
  },

  json: function (options) {
    if (options) {
      if (options.url && !/\?/.test(options.url)) {
        options.url += "?_timestamp=" + Date.now();
      }

      if (Util.isFunction(options.hangingRequestCallback)) {
        var requestID = JSON.stringify(options);
        options.success = createCallbackWrapper(options.success, requestID);
        options.error = createCallbackWrapper(options.error, requestID);

        if (isRequestActive(requestID)) {
          options.hangingRequestCallback();
          return;
        } else {
          setRequestState(requestID, true);
          delete options.hangingRequestCallback;
        }
      }

      if (options.method && options.method !== "GET" && !options.contentType) {
        if (options.data) {
          options.data = JSON.stringify(options.data);
        }
      }
    }

    options = Util.extend({}, {
      contentType: "application/json; charset=utf-8",
      type: "json",
      method: "GET"
    }, options);

    /* eslint-disable consistent-return */
    return Reqwest.reqwest(options);
    /* eslint-enable consistent-return */
  },

  parseResponseBody: function (xhr) {
    // Handle html document returned with 404 gracefully,
    // to not break functionality
    if (typeof xhr.getResponseHeader === "function") {
      var contentType = xhr.getResponseHeader("Content-Type");
      if (contentType && contentType.indexOf("text/html") >= 0) {
        return {};
      }
    }

    var responseJSON = xhr.responseJSON;
    var responseText = xhr.responseText;

    if (responseJSON) {
      return responseJSON;
    }

    if (responseText) {
      try {
        return JSON.parse(responseText);
      } catch (e) {
        return {
          description: responseText
        };
      }
    }

    return {};
  },

  /**
   * Allows overriding the response of an ajax request as well
   * as the success or failure of a request.
   *
   * @param  {Object} actionsHash The Actions file configuration
   * @param  {String} actionsHashName The actual name of the actions file
   * @param  {String} methodName The name of the method to be stubbed
   * @return {Function} A function
   */
  stubRequest: function (actionsHash, actionsHashName, methodName) {
    if (!global.actionTypes) {
      global.actionTypes = {};
    }

    // Cache the method we're stubbing
    var originalFunction = actionsHash[methodName];

    function closure() {
      // Store original RequestUtil.json
      var requestUtilJSON = RequestUtil.json;
      // `configuration` will contain the config that
      // is passed to RequestUtil.json
      var configuration = null;
      // The configuration for the given method, this should be set externally
      var methodConfig = global.actionTypes[actionsHashName][methodName];

      // Proxy calls to RequestUtil.json
      RequestUtil.json = function (object) {
        configuration = object;
      };

      // The event type that we'll call success/error for the ajax request
      var eventType = methodConfig.event;
      // This will cause `configuration` to be set
      originalFunction.apply(actionsHash, arguments);

      // Restore RequestUtil.json
      RequestUtil.json = requestUtilJSON;

      var response = {};

      if (methodConfig[eventType] && methodConfig[eventType].response) {
        response = methodConfig[eventType].response;
      } else if (eventType === "error") {
        response = {responseJSON: {error: "Some generic error"}};
      }

      configuration[eventType](response);
    }

    // Return a function so that we can use setTimeout in the end.
    return function () {
      var args = arguments;
      setTimeout(function () {
        closure.apply(null, args);
      }, global.actionTypes.requestTimeout || 500);
    };
  }
};

module.exports = RequestUtil;
