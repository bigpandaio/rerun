var request = require('request');
var RetryError = require('./error/retry');
var promiseRetry = require('./promise');
var Q = require('q');

module.exports = function (requestData, retries) {
  var retries = retries || requestData.retries;

  return promiseRetry(function () {
    return Q.nfcall(request, requestData).then(function (answer) {
      var response = answer[0];
      var body = answer[1];
      if (response && response.statusCode >= 300 && response.statusCode != 400) {
        return Q.reject(new RetryError('Status code: ' + response.statusCode + '. ' + (body ? 'body: ' + JSON.stringify(body) : '')));
      }

      return Q(answer);
    }, { retries: retries });
  });
}