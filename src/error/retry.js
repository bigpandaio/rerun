function RetryError(message) {
  this.name = 'RetryError';
  this.message = message;
  this.stack = (new Error()).stack;
}

RetryError.prototype = new Error;

module.exports = RetryError