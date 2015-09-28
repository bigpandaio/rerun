var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(chaiAsPromised);
chai.use(sinonChai);


var rerunProxy = require('../../src/index').proxy;
var Q = require('q');

describe('Object proxy retry tests', function () {

  describe('proxied object function', function() {

    it('should retry in case of an error', function() {
      var obj = { foo: function() {} }
      var stub = sinon.stub(obj, 'foo')
      var proxy = rerunProxy.all(obj, {retries: 2, retryFactor: 0, retryTimeout: 10});

      stub.onFirstCall().throws();
      stub.onSecondCall().returns(Q());

      var promise = proxy.foo()
      return expect(promise).to.be.fulfilled
    })

  })

  describe('only selected functions', function() {

    it('should retry', function() {
      var obj = { foo: function() {}, bar: function() {} }
      var fooStub = sinon.stub(obj, 'foo')
      var barStub = sinon.stub(obj, 'bar')
      var proxy = rerunProxy.some(obj, ['foo'], {retries: 2, retryFactor: 0, retryTimeout: 10});

      fooStub.onFirstCall().throws();
      fooStub.onSecondCall().returns(Q());

      barStub.onFirstCall().returns(Q.reject(new Error()))
      barStub.onSecondCall().returns(Q());

      var fooPromise = proxy.foo()
      var barPromise = proxy.bar()

      var expectations = [ expect(fooPromise).to.be.fulfilled,
                           expect(barPromise).to.be.rejected ]

      return Q.all(expectations);
    })
  })
})