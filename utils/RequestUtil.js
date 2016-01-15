var Reqwest = require("./Reqwest");
var Util = require("./Util");

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
  json: function (options) {
    if (options) {
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

        if (!options.type) {
          options.type = "text";
        }
      }
    }

    options = Util.extend({}, {
      contentType: "application/json; charset=utf-8",
      type: "json",
      timeout: 2000,
      method: "GET"
    }, options);
    /* eslint-disable consistent-return */
    return Reqwest.reqwest(options);
    /* eslint-enable consistent-return */
  }
};

module.exports = RequestUtil;
