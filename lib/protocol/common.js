'use strict';

var _ = require('lodash');
var errors = require('../errors');
var Promise = require('bluebird');
var crypto = require('../util/crypto');
var sjcl = require('../util/sjcl');
var errors = require('../errors');
var validate = require('../util/validate');
var base58 = require('bs58');
var hash = require("tokend-js-base").hash;
var Keypair = require("tokend-js-base").Keypair;
var nacl = require('tweetnacl');
var axios = require('axios');

module.exports = {
    getKdfParams: getKdfParams,
    walletShowLoginParams: walletShowLoginParams,
    generateKeychainData: generateKeychainData,
    generateTfaData: generateTfaData,
    calculateWalletId: calculateWalletId,
    decryptWallet: decryptWallet,
    walletShow: walletShow
};

function walletShowLoginParams(params) {
    return axios.post(params.server + '/wallets/show_login_params', { username: params.username })
        .then(function(response) {
            params.salt = response.data.salt;
            params.kdfParams = JSON.parse(response.data.kdfParams);
            return params;
        }).catch(function(err) {
            var body = err.response.data;
            return Promise.reject(errors.getProtocolError(err.response.status, 'Wrong email'));
        });
}

var cachedKdfParams = null;

function getKdfParams(params) {
    // User provided kdfParams
    if (_.isObject(params.kdfParams)) {
        return Promise.resolve(params);
    }

    // kdfParams has been cached
    if (cachedKdfParams) {
        params.kdfParams = cachedKdfParams;
        return Promise.resolve(params);
    }

    // Fetching kdfParams from stellar-wallet server
    return axios.get(params.server + '/kdf_params')
        .then(function(response) {
            cachedKdfParams = response.data;
            params.kdfParams = cachedKdfParams;
            return params;
        }).catch(function(err) {
            var body = err.response.data;
            return Promise.reject(errors.getProtocolError(err.response.status, body.detail));
        });
}

function generateKeychainData(params) {
    var s1 = nacl.util.encodeBase64(nacl.randomBytes(16)); // S0
    var masterKey = crypto.calculateMasterKey(s1, params.username, params.password, params.kdfParams);
    var walletId = crypto.deriveWalletId(masterKey); // W
    var walletKey = crypto.deriveWalletKey(masterKey); // Kw

    params.salt = s1;
    params.rawMasterKey = masterKey;
    params.rawWalletId = walletId;
    params.walletId = sjcl.codec.base64.fromBits(walletId);
    params.rawWalletKey = walletKey;

    params.keychainData = crypto.encryptData(params.rawKeychainData, walletKey);
    params.keychainDataHash = crypto.sha1(params.keychainData);
    console.log('keychain done')
    return Promise.resolve(params);
}

function generateTfaData(params) {
    var keypair = Keypair.random();
    var s2 = nacl.util.encodeBase64(nacl.randomBytes(16)); // S0
    var tfaMasterKey = crypto.calculateMasterKey(s2, params.username, params.password, params.kdfParams);
    var tfaWalletKey = crypto.deriveWalletKey(tfaMasterKey); // Kw

    params.tfaSalt = s2;
    params.rawTfaKeychainData = JSON.stringify({ seed: keypair.secret(), accountId: keypair.accountId() });
    params.tfaKeychainData = crypto.encryptData(params.rawTfaKeychainData, tfaWalletKey);
    params.tfaKeychainDataHash = crypto.sha1(params.tfaKeychainData);
    params.tfaPublicKey = keypair.accountId();
    console.log('tfa keychain done')
    return Promise.resolve(params);
}

function calculateWalletId(params) {
    // We allow to get wallet using password or by providing recovery data: masterKey
    if (params.password) {
        params.rawMasterKey = crypto.calculateMasterKey(params.salt, params.username, params.password, params.kdfParams);
    } else {
        params.rawMasterKey = sjcl.codec.base64.toBits(params.masterKey);
    }
    params.rawWalletId = crypto.deriveWalletId(params.rawMasterKey); // W
    params.rawWalletKey = crypto.deriveWalletKey(params.rawMasterKey); // Kw
    params.walletId = sjcl.codec.base64.fromBits(params.rawWalletId);

    return Promise.resolve(params);
}

function walletShow(params) {
    var data = {
        username: params.username,
        walletId: params.walletId
    };
    return axios(params.server + '/wallets/show', {
        method: "post",
        data: data,
        withCredentials: true
	}).then(function(response) {
        params = _.extend(params, _.pick(response.data, ['accountId', 'keychainData', 'updatedAt']));
        params.tfaEnabled = response.data.tfa_enabled;
        params.detached = response.data.detached;
        params.paging_token = response.data.paging_token;
        params.organization = response.data.organization;
        return params;
    }).catch(function(err) {
		console.log(err)
        var body = err.response.data;
        if (body.type.indexOf('tfa_required') > -1) {
            return Promise.reject({
                status: 403,
                tfaRequired: true,
                phone: body.extras.phone_mask,
                token: body.extras.token,
                walletId: params.walletId,
                rawMasterKey: params.rawMasterKey,
                rawWalletId: params.rawWalletId,
                rawWalletKey: params.rawWalletKey,
                detached: params.detached,
                paging_token: params.paging_token,
                organization: params.organization
            });
        }
        return Promise.reject(errors.getProtocolError(err.response.status, 'Wrong password'));
    });
}

function decryptWallet(params) {
    var wallet = _.pick(params, [
        'server',
        'username',
        'accountId',
        'rawMasterKey',
        'rawWalletId',
        'rawWalletKey',
        'rawKeychainData',
        'updatedAt',
        'paging_token',
        'detached',
        'organization'
    ]);

    wallet.rawKeychainData = crypto.decryptData(params.keychainData, params.rawWalletKey);

    return Promise.resolve(wallet);
}
