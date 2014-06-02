var request = require('request');
var RejectError = require('./error/reject');
var ApiError = require('./error/api');
var promiseRetry = require('./promise');
var Q = require('q');

module.exports = function (requestData) {
  return promiseRetry(function () {
    return Q.nfcall(request, requestData).then(function (answer) {
      var response = answer[0];
      var body = answer[1];

      if (response && response.statusCode == 400) {
        return Q.reject(new RejectError('Status code: ' + response.statusCode + '. ' + (body ? 'body: ' + JSON.stringify(body) : ''), { response: response, body: body, statusCode: response.statusCode }));
      } else if (response && response.statusCode >= 300) {
        return Q.reject(new ApiError('Status code: ' + response.statusCode + '. ' + (body ? 'body: ' + JSON.stringify(body) : ''), { response: response, body: body, statusCode: response.statusCode }));
      }

      return Q(answer);
    })
  }, requestData);
};