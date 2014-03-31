var Q = require('q');

module.exports = function (toRetry, options) {
  var deferred = Q.defer();
  var options = options || {};
  var retries = options.retries || 3;
  var timeout = options.retryTimeout || 50;
  var factor = options.retryFactor || 1;
  var RejectError = options.rejectError || require('./error/reject');

  function _succeed(returned) {
    return deferred.resolve(returned);
  }

  function _failed(error) {
    if (error instanceof RejectError || --retries <= 0) {
      deferred.reject(error);
    } else {
      Q.delay(timeout).then(function () { return toRetry() }).then(_succeed, _failed);
      timeout *= factor;
    }
  }

  toRetry().then(_succeed, _failed);

  return deferred.promise;
}