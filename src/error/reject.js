function RejectError(message) {
  this.name = 'RejectError';
  this.message = message;
  this.stack = (new Error()).stack;
}

RejectError.prototype = new Error;

module.exports = RejectError