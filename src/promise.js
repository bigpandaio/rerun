var Q = require('q');
var RejectError = require('./error/reject');

module.exports = function (toRetry, options) {
  var deferred = Q.defer();
  var options = options || {};
  var retries = options.retries || 3;
  var timeout = options.retryTimeout || 50;
  var factor = options.retryFactor || 1;
  var userRejectError = options.rejectError || RejectError;
  var randomizeRetry = options.retryRandom || false;

  function _succeed(returned) {
    return deferred.resolve(returned);
  }

  function _failed(error) {
    if (error instanceof RejectError || error instanceof userRejectError || --retries <= 0) {
      deferred.reject(error);
    } else {
      var timeToWait = randomizeRetry ? Math.random() * (timeout / 2) + (timeout / 2) : timeout; 
      Q.delay(timeToWait).then(function () { return toRetry() }).then(_succeed, _failed);
      timeout *= factor;
    }
  }

  Q().then(function() { return toRetry(); }).then(_succeed, _failed);

  return deferred.promise;
}