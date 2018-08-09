'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var axios = require('axios');
var validate = require('../util/validate');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(common.getKdfParams)
        .then(common.generateKeychainData)
        .then(common.generateTfaData)
        .then(sendWalletCreateRequest);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"))
        .then(validate.present("password"))
        .then(validate.string("accountId"))
        .then(validate.string("userAccountId"))
        .then(validate.string("rawKeychainData"))
}

function sendWalletCreateRequest(params) {
    params.kdfParams = JSON.stringify(params.kdfParams);

    var reqData = _.pick(params, [
        'username',
        'walletId',
        'salt',
        'accountId',
        'keychainData',
        'keychainDataHash',
        'tfaSalt',
        'tfaKeychainData',
        'tfaKeychainDataHash',
        'tfaPublicKey',
        'kdfParams',
    ])
    // optional fields
    reqData.recovery_code = params.recovery_code
    reqData.referrer = params.referrer
    
    if (params.userAccountId && params.userAccountId !== params.accountId) {
        reqData.accountId = params.userAccountId
        reqData.currentAccountId = params.accountId
    }

    return axios.post(params.server + '/wallets/create', reqData)
        .then(function(response) {
            var wallet = _.pick(params, [
                'server',
                'username',
                'rawMasterKey',
                'rawWalletId',
                'rawWalletKey',
                'rawKeychainData',
            ]);
            wallet.accountId = response.data.accountId
            return wallet;
        }).catch(function(err) {
            var body = err.response.data;
            if (body.type.indexOf('tfa_required') > -1) {
                return Promise.reject({
                    status: 403,
                    tfaRequired: true,
                    phone: body.extras.phone_mask,
                    token: body.extras.token
                });
            }
            return Promise.reject(errors.getProtocolError(err.response.status, body.detail));
        });
}