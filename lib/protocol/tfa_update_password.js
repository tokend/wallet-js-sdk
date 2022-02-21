'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var validate = require('../util/validate');
var axios = require('axios');

module.exports = function (payload) {
  const data = payload.data
  const params = payload.params
  const config = payload.config
  var prefix = '/wallets/update';
  return axios.post(params.server + prefix, data, config)
    .then(function(response) {
      return params.walletId;
    }).catch(function(err) {
      var body = err.response.data;
      if (body.type.indexOf('tfa_required') > -1) {
        return Promise.reject({
          status: 403,
          tfaRequired: true,
          phone: body.extras.phone_mask,
          token: body.extras.token,
          requestData: data
        });
      }
      return Promise.reject(errors.getProtocolError(err.response.status, body.detail));
    });
}
