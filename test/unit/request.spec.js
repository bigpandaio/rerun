var chai = require('chai');
var expect = chai.expect;

var nock = require('nock');
var retry = require('../../src/index')
var request = retry.request;

describe('Retry tests', function () {
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
    }, function () {
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
    nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(401);
    nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(200);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 4, method: 'POST' });
    promise.then(function () {
      done();
    }, function (error) {
      done(error);
    });
  });
  it('should not retry on user error', function (done) {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(400);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 3, method: 'POST' });
    promise.then(function () {
      done(new Error('Should fail'));
    }, function () {
      scope.done();
      done();
    });
  });

  it('should not retry even if rejecterror is defined weird', function (done) {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(400);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 3, method: 'POST', rejectError: undefined });
    promise.then(function () {
      done(new Error('Should fail'));
    }, function () {
      scope.done();
      done();
    });
  });

  it('should not retry even if rejecterror is defined', function (done) {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(400);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 3, method: 'POST', rejectError: require('../../src/promise') });
    promise.then(function () {
      done(new Error('Should fail'));
    }, function () {
      scope.done();
      done();
    });
  });

  it('should wait exponential time', function (done) {
    var id = { complicated: 'id' };
    var data = [
      { foo: 'bar' }
    ];
    var array = [
      { id: id, data: data }
    ];
    nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).times(4).reply(401);
    var scope = nock('http://localhost:3027').post('/test', JSON.stringify({ objects: array })).reply(200);
    var promise = request({ url: 'http://localhost:3027/test', json: { objects: array }, retries: 5, retryFactor: 2, retryTimeout: 10, method: 'POST' });
    var timeBefore = new Date().getTime();
    promise.then(function () {
      expect(new Date().getTime() - timeBefore).to.lte(170).and.to.gte(130);
      scope.done();
      done();
    }, function (err) {
      done(err);
    });
  });


  it('should randomize time', function (done) {
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
    promise.then(function () {
      expect(new Date().getTime() - timeBefore).to.lte(200).and.to.gte(100);
      scope.done();
      done();
    }, function (err) {
      done(err);
    });
  });
});