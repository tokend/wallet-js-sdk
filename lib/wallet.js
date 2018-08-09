'use strict';

var _ = require('lodash');
var crypto = require('./util/crypto');
var errors = require('./errors');
var sjcl = require('./util/sjcl');
var nacl = require('tweetnacl');
var Promise = require('bluebird');
var protocol = require('./protocol');

function Wallet(p) {
  var params = _.cloneDeep(p);
  var self = this;
  var properties = [
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
  ];

  _.each(properties, function(param) {
    self[param] = params[param];
  });

  this.updateEncodedValues = function() {
    this.masterKey = sjcl.codec.base64.fromBits(this.rawMasterKey);
    this.walletId = sjcl.codec.base64.fromBits(this.rawWalletId);
    this.walletKey = sjcl.codec.base64.fromBits(this.rawWalletKey);
  };

  // rtrim /
  this.server = this.server.replace(/\/+$/g,'');
  this.updateEncodedValues();
}

Wallet.prototype.getServer = function() {
  return this.server;
};

Wallet.prototype.getUsername = function() {
  return this.username;
};

Wallet.prototype.getWalletId = function() {
  return this.walletId;
};

Wallet.prototype.getWalletKey = function() {
  return this.walletKey;
};

Wallet.prototype.getUpdatedAt = function() {
  return this.updatedAt;
};

Wallet.prototype.getKeychainData = function() {
  return this.rawKeychainData;
};

Wallet.prototype.delete = function(p) {
  var params = _.cloneDeep(p);
  params = _.extend(params, _.pick(this, [
    'server',
    'walletId',
    'username'
  ]));

  return protocol.deleteWallet(params);
};

Wallet.prototype.changePassword = function(p) {
  var params = _.cloneDeep(p);
  params = _.extend(params, _.pick(this, [
    'server',
    'username',
    'walletId',
    'rawKeychainData'
  ]));

  var self = this;
  return protocol.changePassword(params)
    .then(function(updateData) {
      self.rawWalletId  = updateData.rawWalletId;
      self.rawWalletKey = updateData.rawWalletKey;
      self.rawMasterKey = updateData.rawMasterKey;
      self.updateEncodedValues();

      return Promise.resolve();
    });
};

module.exports = Wallet;