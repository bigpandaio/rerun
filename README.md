rerun [![Build Status](https://travis-ci.org/bigpandaio/rerun.svg?branch=master)](https://travis-ci.org/bigpandaio/rerun)
=====

A retry library for node.js.<br/>
Rerun supports promises and request.js, as you will see, the API is pretty simple.

The options and their defaults for rerun library are:
```javascript
{
  retries: 3
  retryTimeout: 50
  retryFactor: 1
}
```

* `retries` - How many times to retry before failing.
* `retryTimeout` - The initial time to wait (in milliseconds) before each retry.
* `retryFactor` - The multiplier after each fail to multiply `retryTimeout` with.

Request
-------
Rerun use with request is the same as with request itself, but with promises.
```javascript
  var request = require('rerun').request;
  var promise = request({method:'POST', url: 'http://localhost/test', retries: 2, retryTimeout: 10, retryFactor: 2});
```

Promise
-------
Rerun with promises is easy too, all you need is to call the library with the function you want to retry, and if it fails, the library will try again.<br/>
Notice that if you don't want the library to retry, you can throw `require('rerun').RejectError`.
```javascript
  var retry = require('rerun').promise;
  var promise = retry(function () { doSomething(); }, { retries: 2, retryTimeout: 10, retryFactor: 2 });
```

Object Proxy
------------
Want to proxy all methods of an object with rerun functionality? Piece of cake! To proxy all methods:
```javascript
  var object = { foo: function() {} }
  var retry = require('rerun').proxy;
  var proxy = retry.all(object, { retries: 2, retryTimeout: 10, retryFactor: 2 })
  var promise = proxy.foo()
```
To proxy only some methods:
```javascript
  var object = { foo: function() {}, bar: function() {}}
  var retry = require('rerun').proxy;
  var proxy = retry.some(object, ['foo'], { retries: 2, retryTimeout: 10, retryFactor: 2 })
  var promise = proxy.foo()
```
__Notice that proxied functions are expected to return a promise.__

