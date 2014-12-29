var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAsPromised);


var rerun= require('../../src/index').promise;
var Q = require('q');

describe('Promise retry tests', function () {

  describe('wrapped function that throws an exception', function() {

    it('should eventually fail', function() {
      var promise = rerun(function() { throw new Error() }, {retries: 2, retryFactor: 1, retryTimeout: 10});
      return expect(promise).to.be.rejected
    })

  })

  describe('wrapped function that returns a rejected promise', function() {

    it('should eventually fail', function() {
      var promise = rerun(function() { return Q.reject(new Error()) }, {retries: 2, retryFactor: 1, retryTimeout: 10});
      return expect(promise).to.be.rejected;
    })

  })

  describe('wrapped function that returns a resolved promise', function() {

    it('should return a resolved promise after one retry', function() {
      var retries = 2;
      var promise = rerun(function() { return Q(--retries) }, {retries: 2, retryFactor: 0, retryTimeout: 10});
      return expect(promise).to.eventually.equal(1);
    })

  })

  describe('wrapped function that returns a value', function() {

    it('should return a resolved promise after one retry', function() {
      var retries = 2;
      var promise = rerun(function() { return --retries }, {retries: 2, retryFactor: 0, retryTimeout: 10});
      return expect(promise).to.eventually.equal(1);
    })

  })

})