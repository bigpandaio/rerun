var promise = require('./promise');

function proxy(object, methods, options) {
  var proxy = {};
  Object.keys(object).forEach(function(key) {
    if (typeof object[key] === 'function') {
      if (methods != null && methods.length > 0 && methods.indexOf(key) < 0) {
        proxy[key] = object[key];
        return;
      }

      proxy[key] = function() {
        var args = Array.prototype.slice.call(arguments)
        return  promise(function() {
          return object[key].apply(null, args);
        }, options)
      }
    }
  })
  return proxy;
}

module.exports.some = function(object, methods, options) {
  return proxy(object, methods, options);
}

module.exports.all = function(object, options) {
  return proxy(object, null, options);
}
