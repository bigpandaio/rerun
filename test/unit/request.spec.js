var chai = require('chai');
var expect = chai.expect;

var nock = require('nock');
var retry = require('../../src/index')
var request = retry.request;

function upperFirst(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}

describe('Retry tests', function () {
  var ORG = 'pandaorg';
  var objectId;
  var objectId2;

  it('should fail after four tries', function (done) {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).times(4).reply(401);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 4, method: 'POST' });
    promise.then(function () {
      done(new Error('should fail'));
    }, function (error) {
      scope.done();
      done();
    });
  });

  it('should succeed after two tries', function (done) {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).times(2).reply(200);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 4, method: 'POST' });
    promise.then(function () {
      scope.done();
      done();
    }, function (error) {
      done(error);
    });
  });
});