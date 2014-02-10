var request = require('request');
var Q = require('q');

module.exports = function (requestData, retries) {
  var deferred = Q.defer();
  var retries = retries || requestData.retries || 3;

  function _innerCallback(error, response, body) {
    if (response && response.statusCode >= 300) {
      error = 'Status code: ' + response.statusCode + '. ' + (body ? 'body: ' + JSON.stringify(body) : '');
    }
    // User error, we should not retry
    if (response && response.statusCode == 400) {
      retries = 0;
    }
    if (error) {
      if (--retries <= 0) {
        return deferred.reject(new Error(error));
      } else {
        return request(requestData, _innerCallback);
      }
    }
    return deferred.resolve();
  }

  request(requestData, _innerCallback);

  return deferred.promise;
}