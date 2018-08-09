'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var nacl = require('tweetnacl');
var Promise = require('bluebird');
var axios = require('axios');
var sjcl = require('../util/sjcl');
var validate = require('../util/validate');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(common.getKdfParams)
        .then(prepareDataToSend)
        .then(createWallet);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"))
        .then(validate.present("password"))
        .then(validate.string("publicKey"))
        .then(validate.string("accountId"))
        .then(validate.string("mainData"))
        .then(validate.string("keychainData"));
}

function prepareDataToSend(params) {
    var s0 = nacl.util.encodeBase64(nacl.randomBytes(16)); // S0
    var masterKey = crypto.calculateMasterKey(s0, params.username, params.password, params.kdfParams);
    var walletId = crypto.deriveWalletId(masterKey); // W
    var walletKey = crypto.deriveWalletKey(masterKey); // Kw

    params.kdfParams = JSON.stringify(params.kdfParams);

    params.salt = s0;
    params.rawMasterKey = masterKey;
    params.rawWalletId = walletId;
    params.walletId = sjcl.codec.base64.fromBits(walletId);
    params.rawWalletKey = walletKey;

    params.rawMainData = params.mainData;
    params.mainData = crypto.encryptData(params.mainData, walletKey);
    params.mainDataHash = crypto.sha1(params.mainData);

    params.rawKeychainData = params.keychainData;
    params.keychainData = crypto.encryptData(params.keychainData, walletKey);
    params.keychainDataHash = crypto.sha1(params.keychainData);

    return Promise.resolve(params);
}

function createWallet(params) {
    var prefix = "/wallets/create";
    var config = crypto.getRequestConfig(prefix, params.keypair);
    config.headers['Content-Type'] = 'application/json'

    var reqData = _.pick(params, [
        'username',
        'walletId',
        'accountId',
        'salt',
        'publicKey',
        'mainData',
        'mainDataHash',
        'keychainData',
        'keychainDataHash',
        'kdfParams',
        'server',
        'usernameProof'
    ])

    return axios.post(params.server + prefix, reqData, config)
        .then(function(response) {
            return response;
        }).catch(function(err) {
            var body = err.response.data;
            return Promise.reject(errors.getProtocolError(err.response.status, body.detail));
        });
}