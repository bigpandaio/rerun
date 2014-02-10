var Q = require('q');
var RejectError = require('./error/reject');

module.exports = function (toRetry, options) {
  var deferred = Q.defer();
  var retries = (options && options.retries) || 3;

  function _succeed(returned) {
    return deferred.resolve(returned);
  }

  function _failed(error) {
    if (error instanceof RejectError || --retries <= 0) {
      deferred.reject(error);
    } else {
      toRetry().then(_succeed, _failed);
    }
  }

  toRetry().then(_succeed, _failed);

  return deferred.promise;
}