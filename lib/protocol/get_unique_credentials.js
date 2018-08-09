'use strict';

var _ = require('lodash');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var validate = require('../util/validate');

module.exports = function (params) {
  return Promise.resolve(params)
    .then(validateParams)
    .then(getUniqueCredentials);
};

function validateParams(params) {
  return Promise.resolve(params)
    .then(validate.present("server"))
    .then(validate.present("key"))
}

function getUniqueCredentials(params) {
  var resolver = Promise.pending();

  request
    .get(params.server+'/wallets/unique?key=' + params.key)
    .end(function(err, res) {
      /* istanbul ignore if */
      if (!err) {
        resolver.resolve(res);
      } else {
        resolver.reject(err);
      }
    });

  return resolver.promise;
}
