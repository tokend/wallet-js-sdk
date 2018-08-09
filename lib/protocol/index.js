'use strict';

var _ = require('lodash');
var camelCase = require('camel-case');
var Promise = require('bluebird');

module.exports = {};

// Add protocol methods
var protocolMethods = [
    'login',
    'show_wallet',
    'create_wallet',
    'create_admin_wallet',
    'set_phone',
    'verify_tfa_code',
    'get_unique_credentials',
    'resend_token',
    'require_recovery',
    'change_password',
    'tfa_update_password',
    'check_password',
];
_.each(protocolMethods, function(method) {
    module.exports[camelCase(method)] = function(params) {
        return Promise.resolve(params)
            .then(require('./' + method));
    }
});