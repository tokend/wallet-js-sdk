/*

In mock server following users exist:

bartek@stellar.org
------------------
Password: 1234567890
keychainData: {"authToken":"vNKkuhb9XuwK17kuXGH1Lr29WeyQOSgsPi8oDdO4vhc=","updateToken":"qmgCiXJmyLniKB+weqbxTCbgKRXhep+G2SPT6FDBmu8=","signingKeys":{"address":"gK1UXqXDKRANNFvmcHXHhxwM2KnqiszWSj","secret":"s32UsXsFwqXGxt8dvDTsCdNjBmhxKohdKoBHSWbGM4rBibXN1Fi","secretKey":"u5u/mMcUgKLMY4Er2h1J94Xf2cS+1w3hSK+kfwCGoqzV88+SyOraYvvn2rPvJvakfXIsWGlix9zBnXwKKfZZEQ==","publicKey":"1fPPksjq2mL759qz7yb2pH1yLFhpYsfcwZ18Cin2WRE="}}
recoveryCode: Be6dkzayXgh7Zy6Z5TkYs4ob2trxSD36ayvPVB9SQRd8

jared@stellar.org
-----------------
Password: 0987654321
keychainData: {"authToken":"jLOpXT2Ja5s/pjZD0fL1vDw9ASLHYTspqI1FjvtRotM=","updateToken":"5BOutxvJQblinjfRKl2Gb/lAOYRoJmEDCyyTlwLLlxc=","signingKeys":{"address":"grdCvaWb6VXRdF6k1osi1LTUqjCyocK1m","secret":"sfR5yFoFqFFV5Em27DL7y2DihNyvPTVS43q7r7KJYHY98ERaLeq","secretKey":"JLBApQUe4QAsQkiaUOkJ94wgtMMmiyzcxP+DeFPynKnuxJAEX3ifUYzoxeEdeQLIXSZ0A6XUBJFktUdwIh+pOg==","publicKey":"7sSQBF94n1GM6MXhHXkCyF0mdAOl1ASRZLVHcCIfqTo="}}
recoveryCode: no

*/

var testWallet = { //password: 123Qwe
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

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.get('/kdf_params', function(req, res) {
    res.status(200).send({
        algorithm: 'scrypt',
        bits: 256,
        n: Math.pow(2, 12),
        r: 8,
        p: 1,
    });
});

app.post('/wallets/show_login_params', function(req, res) {
    switch (req.body.username) {
      case 'loteha@envy17.com': {
        res.status(200).send({
          username: "loteha@envy17.com",
          salt: "hJe1n3ft/JCP4fteYEIh2g==",
          kdfParams: "{\"algorithm\":\"scrypt\",\"bits\":256,\"n\":4096,\"r\":8,\"p\":1}",
          tfaEnabled: false,
          phone: ""
        });
        break;
      }
      default:
        res.status(404).send({"status": "404", "code": "not_found"});
    }
});

app.post('/wallets/get_tfa_secret', function(req, res) {
  console.log('GET TFA')
    if (req.body.username === 'loteha@envy17.com' && req.body.walletId === 'EvA4lZdaj9jL9jDAfZxFiOwrl/ygMZcbqUYjwgaHg2o=') {
        res.status(200).send({
            "tfaSalt": "hJe1n3ft/JCP4fteYEIh2g==",
            "tfaKeychain": "eyJJViI6ImYwZ2R2eXdHcUxmcFVocmkiLCJjaXBoZXJUZXh0Ijoia3BaOWN4dWd3aFYzRTdFaHRLVVZrK3pWUCt4eEpRSkxicXh0NXpYVitucE05eWdKNDlydWJ3cHZWREt1eHNOZmQzUHROMzIyTHBDelVsYUtBY1k0dml4RXg5bEkyMWRNekhLMi9SS1U1MHV3Ymp3cTh2Z2xHZDM5RmxaWkRLWW40bnN2QXMrbGlMMFVYMW9HMHZoMm1pUGIrSU9pVWNOSGNGSG5acWRIb3JVRktBRXB1d2pqSXl0dm5ua1duL3hTQThKdnZRSTlQYkVoWFE9PSIsImNpcGhlck5hbWUiOiJhZXMiLCJtb2RlTmFtZSI6ImdjbSJ9"
        });
    } else {
        res.status(403).send({ status: "403", code: "forbidden" });
    }
});

app.post('/wallets/show', function(req, res) {
    if (req.body.username === 'loteha@envy17.com' && req.body.walletId === 'EvA4lZdaj9jL9jDAfZxFiOwrl/ygMZcbqUYjwgaHg2o=') {
        res.status(200).send({ //password: 123Qwe
            "id": 1,
            "wallet_id": "EvA4lZdaj9jL9jDAfZxFiOwrl/ygMZcbqUYjwgaHg2o=",
            "username": "loteha@envy17.com",
            "salt": "hJe1n3ft/JCP4fteYEIh2g==",
            "kdf_params": "{\"algorithm\":\"scrypt\",\"bits\":256,\"n\":4096,\"r\":8,\"p\":1}",
            "keychain_data": "eyJJViI6ImYwZ2R2eXdHcUxmcFVocmkiLCJjaXBoZXJUZXh0Ijoia3BaOWN4dWd3aFYzRTdFaHRLVVZrK3pWUCt4eEpRSkxicXh0NXpYVitucE05eWdKNDlydWJ3cHZWREt1eHNOZmQzUHROMzIyTHBDelVsYUtBY1k0dml4RXg5bEkyMWRNekhLMi9SS1U1MHV3Ymp3cTh2Z2xHZDM5RmxaWkRLWW40bnN2QXMrbGlMMFVYMW9HMHZoMm1pUGIrSU9pVWNOSGNGSG5acWRIb3JVRktBRXB1d2pqSXl0dm5ua1duL3hTQThKdnZRSTlQYkVoWFE9PSIsImNpcGhlck5hbWUiOiJhZXMiLCJtb2RlTmFtZSI6ImdjbSJ9",
            "verified": false,
            "phone_number": "",
            "updated_at": "2017-05-02 15:21:14.902514",
            "account_id": "GAFNMBWZSPKBFV7MLOVIFHYULF77LD2OPRSXTK4UTXKL65TXWGD353WV"
        });
    } else {
        res.status(403).send({ status: "403", code: "forbidden" });
    }
});

app.post('/wallets/create', function(req, res) {
    if (req.body.username === 'new_user@stellar.org') {
        res.status(200).send({ "status": "success" });
    } else {
        // Reject all other usernames
        res.status(400).send({ "status": "400", field: "username", code: "already_taken" });
    }
});

app.post('/wallets/set_phone', function(req, res) {
    console.log('set phone request', req);
    if (req.body.username === 'loteha@envy17.com' && req.headers['x-authpublickey'] === testWallet.tfa_public_key) {
        res.status(200).send({ "status": "success" });
    } else {
        // Reject all other usernames
        res.status(401).send({ "status": "401" });
    }
});

app.use(express.static(__dirname + '/../'));

var server = app.listen(process.env.ZUUL_PORT || 3000, function() {
    console.log('Mock server listening on port %d', server.address().port);
});

module.exports = server;