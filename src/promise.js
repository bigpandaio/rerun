var Q = require('q');
var RetryError = require('./error/retry');

module.exports = function (toRetry, options) {
  var deferred = Q.defer();
  var retries = options.retries || 3;

  function _succeed(returned) {
    return deferred.resolve(returned);
  }

  function _failed(error) {
    if (!(error instanceof RetryError) || --retries <= 0) {
      return deferred.reject(error);
    } else {
      return toRetry().then(_succeed, _failed);
    }
  }

  toRetry().then(_succeed, _failed);

  return deferred.promise;
}