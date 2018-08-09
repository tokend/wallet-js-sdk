'use strict';

var util = require("util");

Error.subclass = function(errorName, statusCode) {
  var newError = function(message) {
    this.name    = errorName;
    this.code    = statusCode;
    this.message = (message || "");
  };

  newError.subclass = this.subclass;
  util.inherits(newError, this);

  return newError;
};

var errors = module.exports;

errors.InvalidField =         Error.subclass('InvalidField', 400);
errors.InvalidSignature =     Error.subclass('InvalidSignature', 401);
errors.Forbidden =            Error.subclass('Forbidden', 403);
errors.NotFound =             Error.subclass('NotFound', 404);
errors.Conflict =             Error.subclass('Conflict', 409);
errors.Expired =              Error.subclass('Expired', 410);
errors.LimitExceeded  =       Error.subclass('LimitExceeded', 429);

errors.InvalidUsername =      Error.subclass('InvalidUsername');
errors.InvalidPassword =      Error.subclass('InvalidPassword');
errors.DataCorrupt =          Error.subclass('DataCorrupt');
errors.MissingField =         Error.subclass('MissingField');
errors.ConnectionError =      Error.subclass('ConnectionError');
errors.UnknownError =         Error.subclass('UnknownError', 500);

errors.defaultMsg = {
  expired: 'Your verification code has expired. Please request a new code',
  exist: 'Email already taken',
  notAllowed: 'This action is not allowed',
  notVerified: 'Email is not verified',
  oops: 'Oops...something went wrong :(',
  wrongField: 'Wrong email',
  wrongFields: 'Wrong email or password'
}

errors.getProtocolError = function(code, detail) {
  switch(code) {
    case 400: return new errors.InvalidField(detail);
    case 401: return new errors.InvalidSignature(this.defaultMsg.notAllowed);
    case 403: return new errors.Forbidden(this.defaultMsg.notVerified);
    case 404: return new errors.NotFound(detail);
    case 409: return new errors.Conflict(this.defaultMsg.exist);
    case 410: return new errors.Expired(this.defaultMsg.expired);
    case 429: return new errors.LimitExceeded(detail);
    case 500: return new errors.UnknownError(this.defaultMsg.oops);
    default:  return new errors.UnknownError(detail);
  }
};
