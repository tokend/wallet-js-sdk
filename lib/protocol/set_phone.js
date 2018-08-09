'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var Keypair = require("tokend-js-base").Keypair;
var validate = require('../util/validate');
var sjcl = require('../util/sjcl');
var axios = require('axios');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(common.walletShowLoginParams)
        .then(common.calculateWalletId)
        .then(getTfaKeys)
        .then(decryptTfaKeys)
        .then(common.generateTfaData)
        .then(sendUserPostRequest);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"))
        .then(validate.present("newPhone"))
        .then(validate.present("password"));
}

function getTfaKeys(params) {
    var resolver = Promise.pending();

    var data = {
        username: params.username,
        walletId: params.walletId
    };

    return axios.post(params.server + '/wallets/get_tfa_secret', data)
        .then(function(response) {
            params.tfaKeychainData = response.data.tfaKeychain;
            params.tfaSalt = response.data.tfaSalt;
            return params;
        }).catch(function(err) {
            var body = err.response.data;
            return Promise.reject(errors.getProtocolError(err.response.status, 'Wrong password'));
        });
}

function decryptTfaKeys(params) {
    var tfaRawMasterKey = crypto.calculateMasterKey(params.tfaSalt, params.username, params.password, params.kdfParams);
    var tfaRawWalletId = crypto.deriveWalletId(tfaRawMasterKey); // W
    var tfaRawWalletKey = crypto.deriveWalletKey(tfaRawMasterKey); // Kw
    var tfaWalletId = sjcl.codec.base64.fromBits(tfaRawWalletId);

    var rawTfaKeychainData = crypto.decryptData(params.tfaKeychainData, tfaRawWalletKey);
    params.secretKey = JSON.parse(rawTfaKeychainData).seed;

    return Promise.resolve(params);
}

function sendUserPostRequest(params) {
    var keypairOld = Keypair.fromSecret(params.secretKey);
    var prefix = '/wallets/set_phone';
    var config = crypto.getRequestConfig(prefix, keypairOld);

    var reqData = {
        username: params.username,
        phone: params.newPhone,
        tfaSalt: params.tfaSalt,
        tfaKeychainData: params.tfaKeychainData,
        tfaKeychainDataHash: params.tfaKeychainDataHash,
        tfaPublicKey: params.tfaPublicKey
    };

    return axios.post(params.server + prefix, reqData, config)
        .then(function(response) {
            return { ok: true, status: 200 };
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
