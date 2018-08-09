'use strict';
var errors = require('../errors');
var Promise = require('bluebird');
var validate = require('../util/validate');
var axios = require('axios');

module.exports = function(params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(verify);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("code"))
        .then(validate.present("token"));
}

function verify(params) {
    return axios.get(params.server + '/tfa/verify', {
            params: {
                code: params.code,
                token: params.token
            }
        })
        .catch(function(err) {
            var detail = err.response.status === 400 ? 'Verification code mismatch' : JSON.parse(err.response.data).detail;
            Promise.reject(errors.getProtocolError(err.response.status, detail));
        });
}