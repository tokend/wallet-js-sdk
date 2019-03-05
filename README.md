wallet-js-sdk
=====================

### Usage in a browser
```html
Normal version:
<script src="/build/stellar-wallet.js"></script>
Minified version:
<script src="/build/stellar-wallet.min.js"></script>
```

### Usage in Node
```js
var StellarWallet = require('stellar-wallet-js-sdk');
```

### API

#### `createWallet`

Creates a wallet and uploads it to server.
This method returns [`Wallet` object](#wallet-object).

> **Heads up!** Choose `kdfParams` carefully - it may affect performance.

```js
StellarWallet.createWallet({
  // Required
  server: "https://wallet-server.com/v2",
  // Required
  username: "joedoe@hostname.com",
  // Required
  password: "cat-walking-on-keyboard",
  // keychainData: must be a string. If you want to send JSON stringify it.
  keychainData: "Your keychain data.",
  // If omitted, it will be fetched from stellar-wallet server
  kdfParams: {
    algorithm: 'scrypt',
    bits: 256,
    n: Math.pow(2,16),
    r: 8,
    p: 1
  }
}).then(function(wallet) {
  // wallet is Wallet object
}).catch(StellarWallet.errors.MissingField, function(e) {
  console.error('Missing field: '+e.field+'.');
}).catch(StellarWallet.errors.InvalidField, function(e) {
  console.error('Invalid field.');
}).catch(StellarWallet.errors.UsernameAlreadyTaken, function(e) {
  console.error('Username has been already taken.');
}).catch(StellarWallet.errors.ConnectionError, function(e) {
  console.log('Connection error.');
}).catch(function(e) {
  console.log('Unknown error.');
});
```

To generate a keypair you can use: `StellarWallet.util.generateKeyPair()`.

#### `getWallet`

Retrieves a wallet from server.
This method returns [`Wallet` object](#wallet-object).

```js
StellarWallet.getWallet({
  // Required
  server: "https://wallet-server.com/v2",
  // Required
  username: "joedoe@hostname.com",
  // Required
  password: "cat-walking-on-keyboard"
}).then(function(wallet) {
  // wallet is Wallet object
}).catch(StellarWallet.errors.WalletNotFound, function(e) {
  console.error('Wallet not found.');
}).catch(StellarWallet.errors.Forbidden, function(e) {
  console.error('Forbidden access.');
}).catch(StellarWallet.errors.MissingField, function(e) {
  console.error('Missing field: '+e.field+'.');
}).catch(StellarWallet.errors.ConnectionError, function(e) {
  console.log('Connection error.');
}).catch(function(e) {
  console.log('Unknown error.');
});
```

You can also get wallet using `masterKey`. It's helpful during recovery process:

```js
StellarWallet.getWallet({
  // Required
  server: "https://wallet-server.com/v2",
  // Required
  username: "joedoe@hostname.com",
  // Base64 encoded master key
  masterKey: "masterKey"
}).then(function(wallet) {
  // wallet is Wallet object
}).catch(StellarWallet.errors.WalletNotFound, function(e) {
  console.error('Wallet not found.');
}).catch(StellarWallet.errors.Forbidden, function(e) {
  console.error('Forbidden access.');
}).catch(StellarWallet.errors.MissingField, function(e) {
  console.error('Missing field: '+e.field+'.');
}).catch(StellarWallet.errors.ConnectionError, function(e) {
  console.log('Connection error.');
}).catch(function(e) {
  console.log('Unknown error.');
});
```

### Wallet object

`getWallet` and `createWallet` methods return `Wallet` object. `Wallet` object
has following methods:

#### `getServer`

Returns stellar-wallet server URL.

#### `getUsername`

Returns username associated with this wallet.

#### `getWalletId`

Returns `walletId`.


#### `getKeychainData`

Returns `keychainData` string.


#### `enableRecovery`

Enables recovery to user's wallet. To generate `recoveryCode` you can use:
`StellarWallet.util.generateRandomRecoveryCode()`.

```js
var recoveryCode = StellarWallet.util.generateRandomRecoveryCode();

wallet.enableRecovery({
  recoveryCode: recoveryCode,
  secretKey: keyPair.secretKey
}).then(function() {
  // Everything went fine
}).catch(StellarWallet.errors.MissingField, function(e) {
  console.error('Missing field: '+e.field+'.');
}).catch(StellarWallet.errors.ConnectionError, function(e) {
  console.log('Connection error.');
}).catch(function(e) {
  console.log('Unknown error.');
});
```

After recovery is enabled you can use `recover` method to recover wallet's
`masterKey`.

#### `changePassword`

Allows user to change password.

> **Heads up!** This method changes all values derived from and  `masterKey` itself.

```js
wallet.enableRecovery({
  newPassword: 'some-good-new-password',
  secretKey: keyPair.secretKey
}).then(function() {
  // Everything went fine
}).catch(StellarWallet.errors.MissingField, function(e) {
  console.error('Missing field: '+e.field+'.');
}).catch(StellarWallet.errors.ConnectionError, function(e) {
  console.log('Connection error.');
}).catch(function(e) {
  console.log('Unknown error.');
});
```

You can pass additional parameter: `kdfParams`. If it's not passed `kdfParams`
will be fetched from stellar-wallet server.

#### `delete`

Removes wallet from stellar-wallet server.

> **Heads up!** This method removes all wallet data from the server! This
> operation cannot be undone.

```js
wallet.delete({
  secretKey: keyPair.secretKey
}).then(function() {
  // Everything went... well... fine
}).catch(StellarWallet.errors.ConnectionError, function(e) {
  console.log('Connection error.');
}).catch(function(e) {
  console.log('Unknown error.');
});
```

### Util methods

#### `util.generateRandomRecoveryCode`

Generates random recovery code you can use in `enableRecovery`.

### Build
```sh
npm install
gulp build
```

### Development
```sh
npm install
gulp watch
```

### Testing
```sh
# Node
npm test
# Browser
zuul ./test/wallet.js --local
```
