'use strict';

var _ = require('lodash');
var errors = require('./errors');
var Promise = require('bluebird');
var protocol = require('./protocol');
var crypto = require('./util/crypto')
var Wallet = require('./wallet');

function createWalletObject(initData) {
    var wallet = new Wallet(initData);
    return Promise.resolve(wallet);
}

module.exports = {
    createWallet: function(p) {
        var params = _.cloneDeep(p);
        return protocol.createWallet(params)
            .then(createWalletObject);
    },
    createAdminWallet: function(p) {
        var params = _.cloneDeep(p);
        return protocol.createAdminWallet(params)
            .then(createWalletObject);
    },
    getWallet: function(p) {
        var params = _.cloneDeep(p);
        return protocol.login(params)
            .then(createWalletObject);
    },
    showWallet: function(p) {
        var params = _.cloneDeep(p);
        return protocol.showWallet(params)
            .then(createWalletObject);
    },
    setPhone: function(p) {
        var params = _.cloneDeep(p);
        return protocol.setPhone(params);
    },
    requestTfaCode: function(p) {
        var params = _.cloneDeep(p);
        return protocol.requestTfaCode(params);
    },
    verifyTfaCode: function(p) {
        var params = _.cloneDeep(p);
        return protocol.verifyTfaCode(params);
    },
    recover: function(p) {
        var params = _.cloneDeep(p);
        return protocol.requireRecovery(params);
    },
    resendToken: function(p) {
        var params = _.cloneDeep(p);
        return protocol.resendToken(params);
    },
    getUniqueCredentials: function(p) {
        var params = _.cloneDeep(p);
        return protocol.getUniqueCredentials(params);
    },
    changePassword: function(p) {
        var params = _.cloneDeep(p);
        return protocol.changePassword(params);
    },
    checkPassword: function(p) {
        var params = _.cloneDeep(p);
        return protocol.checkPassword(params);
    },
    tfaUpdatePassword: function(d, c, p) {
      var data = _.cloneDeep(d)
      var config = _.cloneDeep(c)
      var params = _.cloneDeep(p);
      const payload = {
        data: data,
        config: config,
        params: params
      }
      return protocol.tfaUpdatePassword(payload);
    },
    crypto: function(p) {
        return crypto;
    },

    errors: errors,
};