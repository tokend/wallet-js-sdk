'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var nacl = require('tweetnacl');
var Promise = require('bluebird');
var request = require('superagent');
var sjcl = require('../util/sjcl');
var validate = require('../util/validate');
var axios = require('axios');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(resendToken);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"));
}

function resendToken(params) {
    return axios.post(params.server + '/users/unverified/resend_token', { username: params.username })
        .then(function(response) {
            return params;
        }).catch(function(err) {
            return Promise.reject(errors.getProtocolError(err.response.status, 'Wrong email'));
        });
}