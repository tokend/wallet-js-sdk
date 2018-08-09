'use strict';

var _ = require('lodash');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var Keypair = require("tokend-js-base").Keypair;

var StellarWallet;
if (typeof window === 'undefined') {
    StellarWallet = require('../index.js');
}

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

describe('stellar-wallet', function() {
    var self = this;
    self.timeout(30000);

    var server = 'http://localhost:3000';
    var mockServer;

    before(function(done) {
        if (typeof window === 'undefined') {
            // Start mock server. In sauce labs environment zuul is responsible for it.
            mockServer = require('./server.js');
        }

        // Wait for StellarWallet to load in a browser
        function waitForLoad() {
            if (typeof window !== 'undefined' && typeof window.StellarWallet === 'undefined') {
                setTimeout(waitForLoad, 1000);
            } else {
                // zuul hacks
                if (typeof StellarWallet === 'undefined') {
                    StellarWallet = window.StellarWallet;
                    server = '';
                }
                done();
            }
        }
        waitForLoad();
    });

    after(function(done) {
        if (mockServer) {
            mockServer.close();
        }
        done();
    });

    it('should throw MissingField error when server is missing', function(done) {
        StellarWallet.getWallet({
            username: 'test@stellar.org',
            password: '1234567890'
        }).should.be.rejectedWith(StellarWallet.errors.MissingField).and.notify(done);
    });

    it('should throw WalletNotFound error', function(done) {
        StellarWallet.getWallet({
            server: server,
            username: 'notfound@stellar.org',
            password: 'test'
        }).should.be.rejectedWith({ status: 404 }).and.notify(done);
    });

    it('should throw InvalidField error', function(done) {
        StellarWallet.createWallet({
            server: server,
            username: 'bartek@stellar.org',
            password: '1234567890',
            mainData: { email: 'bartek@stellar.org' } // mainData must be stringified
        }).should.be.rejectedWith(StellarWallet.errors.InvalidField).and.notify(done);
    });

    it('should throw InvalidUsername error', function(done) {
        StellarWallet.createWallet({
            server: server,
            username: '^&*^#*&$^&*',
            password: '1234567890'
        }).should.be.rejectedWith(StellarWallet.errors.InvalidField).and.notify(done);
    });

    it('should successfully create a wallet', function(done) {
        var keyPair = Keypair.random();

        StellarWallet.createWallet({
            server: server,
            username: 'new_user@stellar.org',
            password: 'xxx',
            accountId: keyPair.accountId(),
            keychainData: JSON.stringify({ seed: keyPair.secret() }),
            kdfParams: {
                algorithm: 'scrypt',
                bits: 256,
                n: Math.pow(2, 11), // To make tests faster
                r: 8,
                p: 1
            }
        }).then(function(wallet) {
            expect(wallet.getServer()).to.be.equal(server);
            done();
        });
    });

    it('should fail with UsernameAlreadyTaken error', function(done) {
        var keyPair = Keypair.random();

        StellarWallet.createWallet({
            server: server,
            username: 'bartek@stellar.org',
            password: 'qwerty',
            accountId: keyPair.accountId(),
            keychainData: JSON.stringify({ seed: keyPair.secret() }),
            kdfParams: {
                algorithm: 'scrypt',
                bits: 256,
                n: Math.pow(2, 11), // To make tests faster
                r: 8,
                p: 1
            }
        }).should.be.rejectedWith({ status: 400 }).and.notify(done);
    });

    it('should throw Forbidden error when wrong password is passed', function(done) {
        StellarWallet.getWallet({
            server: server,
            username: 'bartek@stellar.org',
            password: 'wrong password'
        }).should.be.rejectedWith({ status: 403 }).and.notify(done);
    });

    it('should be success when set phone', function(done) {
        StellarWallet.setPhone({
            server: server,
            username: 'loteha@envy17.com',
            password: '123Qwe',
            newPhone: '+123434241',
        }).then(function(result) {
            console.log('RESULT', result);
            done();
        }).catch(function(err) {
            done(err)
        });
    });

    // Doesn't work
    it('should successfully get wallet', function(done) {
        StellarWallet.getWallet({
            server: server,
            username: 'bartek@stellar.org',
            password: '1234567890'
        }).then(function(wallet) {
            expect(wallet.getUsername()).to.be.equal('bartek@stellar.org');
            expect(wallet.getServer()).to.be.equal(server);
            expect(wallet.getUpdatedAt()).to.be.equal('2014-10-03 16:30:29');

            var fetchedKeychainData = JSON.parse(wallet.getKeychainData());
            expect(fetchedKeychainData).not.to.be.empty;
            expect(fetchedKeychainData.signingKeys.address).to.be.equal('gK1UXqXDKRANNFvmcHXHhxwM2KnqiszWSj');

            done();
        });
    });

    it('should get wallet with 2FA enabled', function(done, err) {
        StellarWallet.getWallet({
            server: server,
            username: 'jared@stellar.org',
            password: '0987654321',
        }).catch(function(result) {
            expect(result.status).to.be.equal(100)
            expect(result.walletId).to.be.equal('zl0+spNHwMMjXV6BBh6Zj2tTLX5b+FsLvMw6/8YWuZQ=')
            expect(result.phone).to.be.equal("+12132132323")

            return StellarWallet.showWallet({
                server: server,
                username: 'jared@stellar.org',
                walletId: result.walletId,
                verificationCode: '000000',
                rawMasterKey: result.rawMasterKey,
                rawWalletId: result.rawWalletId,
                rawWalletKey: result.rawWalletKey
            }).then(function(wallet) {
                expect(wallet.getUpdatedAt()).to.be.equal('2014-10-03 17:10:51');
                expect(wallet.getKeychainData()).not.to.be.empty;
                expect(JSON.parse(wallet.getKeychainData()).signingKeys.address).to.be.equal('grdCvaWb6VXRdF6k1osi1LTUqjCyocK1m');
                done()
            });
        })
    });

    it('getWallet should not modify params argument object', function(done) {
        var params = {
            server: server,
            username: 'bartek@stellar.org',
            password: '1234567890'
        };
        var paramsCopy = _.cloneDeep(params);
        StellarWallet.getWallet(params).should.be.fulfilled.then(function() {
            expect(params).to.be.deep.equal(paramsCopy);
        }).should.notify(done);
    })
});
