function ApiError(message, data) {
  this.name = 'ApiError';
  this.message = message;
  this.data = data;
  this.stack = (new Error()).stack;
}

ApiError.prototype = new Error;

module.exports = ApiError;