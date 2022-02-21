'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var base = require("@tokend/js-sdk").base;
var Promise = require('bluebird');
var validate = require('../util/validate');
var axios = require('axios');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(common.getKdfParams)
        .then(common.generateKeychainData)
        .then(common.generateTfaData)
        .then(sendUpdateRequest);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.string("username"))
        .then(validate.string("password"))
        .then(validate.string("oldWalletId"))
        .then(validate.string("currentSecretKey"))
        .then(validate.string("accountId"))
        .then(validate.present("rawKeychainData"))
        .then(validate.string("code"));
}

function sendUpdateRequest(params) {
    params.kdfParams = JSON.stringify(params.kdfParams);
    var resolver = Promise.pending();
    var prefix = '/wallets/update';
    var kp = base.Keypair.fromSecret(params.currentSecretKey);
    var config = crypto.getRequestConfig(prefix, kp);

    var data = _.pick(params, [
        'username',
        'walletId',
        'oldWalletId',
        'accountId',
        'salt',
        'keychainData',
        'keychainDataHash',
        'tfaSalt',
        'tfaKeychainData',
        'tfaKeychainDataHash',
        'tfaPublicKey',
        'code',
        'tx'
    ]);

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
                    requestData: data,
                    config: config,
                    params: params
                });
            }
            return Promise.reject(errors.getProtocolError(err.response.status, body.detail));
        });
}
