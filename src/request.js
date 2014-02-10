var request = require('request');
var RejectError = require('./error/reject');
var promiseRetry = require('./promise');
var Q = require('q');

module.exports = function (requestData, retries) {
  var retries = retries || requestData.retries;

  return promiseRetry(function () {
    return Q.nfcall(request, requestData).then(function (answer) {
      var response = answer[0];
      var body = answer[1];

      if (response && response.statusCode == 400) {
        return Q.reject(new RejectError('Status code: ' + response.statusCode + '. ' + (body ? 'body: ' + JSON.stringify(body) : '')));
      } else if (response && response.statusCode >= 300) {
        return Q.reject(new Error('Status code: ' + response.statusCode + '. ' + (body ? 'body: ' + JSON.stringify(body) : '')));
      }

      return Q(answer);
    })
  }, { retries: retries });
}