'use strict';

var _ = require('lodash');
var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var validate = require('../util/validate');

module.exports = function (params) {
  return Promise.resolve(params)
    .then(validateParams)
    .then(sendRecoveryShowRequest);
};

function validateParams(params) {
  return Promise.resolve(params)
    .then(validate.present("server"))
    .then(validate.present("username"));
}

function sendRecoveryShowRequest(params) {
  var resolver = Promise.pending();

  var data =_.pick(params, [
    'username'
  ]);

  request
    .post(params.server+'/wallets/recovery')
    .type('json')
    .send(data)
    .end(function(err, res) {
      /* istanbul ignore if */
      if (err) {
        resolver.reject(new errors.ConnectionError());
      }
      if (res.status !== 200) {
        resolver.reject(errors.getProtocolError(res.status, JSON.parse(res.text).detail));
      } else {
        resolver.resolve(res);
      }
    });

  return resolver.promise;
}
