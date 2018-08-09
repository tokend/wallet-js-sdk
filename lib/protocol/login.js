'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var validate = require('../util/validate');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(common.walletShowLoginParams)
        .then(common.calculateWalletId)
        .then(common.walletShow)
        .then(common.decryptWallet);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"))
        .then(validate.present("password"));
}