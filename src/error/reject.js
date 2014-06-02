function RejectError(message, data) {
  this.name = 'RejectError';
  this.message = message;
  this.data = data;
  this.stack = (new Error()).stack;
}

RejectError.prototype = new Error;

module.exports = RejectError;