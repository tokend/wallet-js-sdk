'use strict';

var common = require('./common');
var Promise = require('bluebird');
var validate = require('../util/validate');

module.exports = function (params) {
  return Promise.resolve(params)
    .then(validateParams)
    .then(common.walletShow)
    .then(common.decryptWallet);
};

function validateParams(params) {
  return Promise.resolve(params)
    .then(validate.present("server"))
    .then(validate.present("username"))
    .then(validate.present("walletId"))
    .then(validate.present("rawMasterKey"))
    .then(validate.present("rawWalletId"))
    .then(validate.present("rawWalletKey"));
}
