var chai = require('chai');
var expect = chai.expect;

var nock = require('nock');
var retry = require('../../src/index')
var request = retry.request;
var Q = require('q');

describe('Requet retry tests', function () {

  it('should fail after four tries', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).times(4).reply(401);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 4, method: 'POST' });
    return promise.then(function () {
      return Q.reject(new Error('should fail'));
    }, function (err) {
      scope.done();
      return Q();
    });
  });

  it('should succeed after two tries', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(401);
    nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(200);
    return request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 4, method: 'POST' });
  });

  it('should not retry on user error', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(400);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 3, method: 'POST' });
    return promise.then(function () {
      Q.reject(new Error('Should fail'));
    }, function () {
      scope.done();
      return Q();
    });
  });

  it('should not retry even if rejecterror is defined weird', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(400);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 3, method: 'POST', rejectError: undefined });
    return promise.then(function () {
      return Q.reject(new Error('Should fail'));
    }, function () {
      scope.done();
      return Q();
    });
  });

  it('should not retry even if rejecterror is defined', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(400);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 3, method: 'POST', rejectError: require('../../src/promise') });
    return promise.then(function () {
      return Q.reject(new Error('Should fail'));
    }, function () {
      scope.done();
      return Q();
    });
  });

  it('should wait exponential time', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    nock('http://localhost:3027').post('/test1', JSON.stringify({ objects: array })).times(4).reply(401);
    var scope = nock('http://localhost:3027').post('/test1', JSON.stringify({ objects: array })).reply(200);
    var promise = request({ url: 'http://localhost:3027/test1', json: { objects: array }, retries: 5, retryFactor: 2, retryTimeout: 10, method: 'POST' });
    var timeBefore = new Date().getTime();
    return promise.then(function () {
      expect(new Date().getTime() - timeBefore).to.lte(170).and.to.gte(130);
      scope.done();
    });
  });


  it('should randomize time', function () {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).times(1).reply(401);
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(200);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 2, retryFactor: 2, retryTimeout: 200, retryRandom: true, method: 'POST' });
    var timeBefore = new Date().getTime();
    return promise.then(function () {
      expect(new Date().getTime() - timeBefore).to.lte(200).and.to.gte(100);
      scope.done();
    })
  });
});