'use strict';

var expect = require('chai').expect;
var crypto = require('../../lib/util/crypto');
var sjcl = require('../../lib/util/sjcl');
var testWallet = {
    "id": 1,
    "wallet_id": "EvA4lZdaj9jL9jDAfZxFiOwrl/ygMZcbqUYjwgaHg2o=",
    "username": "loteha@envy17.com",
    "salt": "hJe1n3ft/JCP4fteYEIh2g==",
    "kdf_params": "{\"algorithm\":\"scrypt\",\"bits\":256,\"n\":4096,\"r\":8,\"p\":1}",
    "keychain_data": "eyJJViI6ImYwZ2R2eXdHcUxmcFVocmkiLCJjaXBoZXJUZXh0Ijoia3BaOWN4dWd3aFYzRTdFaHRLVVZrK3pWUCt4eEpRSkxicXh0NXpYVitucE05eWdKNDlydWJ3cHZWREt1eHNOZmQzUHROMzIyTHBDelVsYUtBY1k0dml4RXg5bEkyMWRNekhLMi9SS1U1MHV3Ymp3cTh2Z2xHZDM5RmxaWkRLWW40bnN2QXMrbGlMMFVYMW9HMHZoMm1pUGIrSU9pVWNOSGNGSG5acWRIb3JVRktBRXB1d2pqSXl0dm5ua1duL3hTQThKdnZRSTlQYkVoWFE9PSIsImNpcGhlck5hbWUiOiJhZXMiLCJtb2RlTmFtZSI6ImdjbSJ9",
    "verification_token": "jZolfrNhPCljCGDrf7H6ryBwVnEE0oY6MzQCFIfbAWvVMZETc3JT-SBvg0-rdIpFtfdSm_F7XtVbRIxuwGI7Vg==",
    "verified": true,
    "phone_number": "+380666813469",
    "created_at": "2017-05-02 15:21:14.902514",
    "updated_at": "2017-05-02 15:21:14.902514",
    "deleted_at": null,
    "account_id": "GAFNMBWZSPKBFV7MLOVIFHYULF77LD2OPRSXTK4UTXKL65TXWGD353WV",
    "current_account_id": "GCVOJG5YHNAI5TWKZ45DDYAA5VP3BSJIFPAQ3GZLQ73V222PXVNYMPWZ",
    "tfa_public_key": "GCVOJG5YHNAI5TWKZ45DDYAA5VP3BSJIFPAQ3GZLQ73V222PXVNYMPWZ",
    "tfa_keychain_data": "eyJJViI6ImYwZ2R2eXdHcUxmcFVocmkiLCJjaXBoZXJUZXh0Ijoia3BaOWN4dWd3aFYzRTdFaHRLVVZrK3pWUCt4eEpRSkxicXh0NXpYVitucE05eWdKNDlydWJ3cHZWREt1eHNOZmQzUHROMzIyTHBDelVsYUtBY1k0dml4RXg5bEkyMWRNekhLMi9SS1U1MHV3Ymp3cTh2Z2xHZDM5RmxaWkRLWW40bnN2QXMrbGlMMFVYMW9HMHZoMm1pUGIrSU9pVWNOSGNGSG5acWRIb3JVRktBRXB1d2pqSXl0dm5ua1duL3hTQThKdnZRSTlQYkVoWFE9PSIsImNpcGhlck5hbWUiOiJhZXMiLCJtb2RlTmFtZSI6ImdjbSJ9",
    "tfa_salt": "hJe1n3ft/JCP4fteYEIh2g=="
}

describe('util/crypto', function() {
    it('should correctly encrypt/decrypt data', function(done) {
        var key = sjcl.random.randomWords(8);
        var secret = 'this is secret data';
        var encrypted = crypto.encryptData(secret, key);
        var decrypted = crypto.decryptData(encrypted, key);
        expect(decrypted).to.be.equal(secret);
        done();
    });
});