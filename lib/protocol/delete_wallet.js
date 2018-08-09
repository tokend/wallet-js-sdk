'use strict';

var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var signRequest = require('../util/crypto').signRequest;

module.exports = function(params) {
  var resolver = Promise.pending();
  request
    .post(params.server+'/wallets/delete')
    .send({
      username:    params.username,
      walletId:    params.walletId
    })
    .use(signRequest(params.username, params.walletId, params.secretKey))
    .end(function(err, res) {
      /* istanbul ignore if */
      if (err) {
        resolver.reject(new errors.ConnectionError());
      }
      if (res.status !== 200) {
        resolver.reject(res);
      } else {
        resolver.resolve(res.body);
      }
    });

  return resolver.promise;
};
