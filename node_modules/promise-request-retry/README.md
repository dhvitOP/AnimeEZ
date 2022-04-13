## request-promise-retry 
#### [npm : promise-request-retry](https://www.npmjs.com/package/promise-request-retry)
[![npm version](https://badge.fury.io/js/promise-request-retry.svg)](https://badge.fury.io/js/promise-request-retry)
[![coverage status](https://coveralls.io/repos/github/void666/request-promise-retry/badge.svg)](https://coveralls.io/github/void666/request-promise-retry)
[![build status](https://travis-ci.org/void666/request-promise-retry.svg?branch=master)](https://travis-ci.org/void666/request-promise-retry)
[![npm downloads](https://img.shields.io/npm/dt/promise-request-retry.svg)](https://img.shields.io/npm/dt/promise-request-retry)

Simple wrapper on top of [request-promise](https://github.com/request/request-promise) to replicate retry mechanism, i.e, it will try to reprocess the request till a valid response is obtained, or the number of retrys is exhausted. Supports all options from request-promise.

### Usage
-  additional parameter `retry` needed in `request-promise` options.
- `retry` supports boolean (defaults to `1` retry) and positive integer.
-  in order to ignore retry or use generic`request-promise`,just don't specify the `retry` parameter.

#### GET Request sample with retry
```
var rp = require('promise-request-retry');
var options = {
    uri: 'https://api.github.com/user/repos',
    qs: {
        access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true, // Automatically parses the JSON string in the response, 
    retry : 2, // will retry the call twice, in case of error.
    verbose_logging : false, // will log errors only, if set to be true, will log all actions
    accepted: [ 400, 404 ] // Accepted HTTP Status codes (will not retry if request response has any of these HTTP Status Code)
    delay: 2000 // will delay retries by 2000 ms.  The default is 100. 
    factor: 2 // will multiple the delay by the factor each time a retry is attempted. 
};

rp(options)
    .then(function (repos) {
        console.log('User has %d repos', repos.length);
    })
    .catch(function (err) {
        // API call failed...
    });
```

##### logging sample
```
2018-03-13T22:20:21.308Z - info: [request-promise-retry] calling http://adadadadad.com/ with retry 3
2018-03-13T22:20:21.899Z - info: [request-promise-retry] Encountered error Error: getaddrinfo ENOTFOUND adadadadad.com adadadadad.com:80 for GET request to http://adadadadad.com/, retry count 3
2018-03-13T22:20:21.904Z - info: [request-promise-retry] Encountered error Error: getaddrinfo ENOTFOUND adadadadad.com adadadadad.com:80 for GET request to http://adadadadad.com/, retry count 2
2018-03-13T22:20:21.907Z - info: [request-promise-retry] Encountered error Error: getaddrinfo ENOTFOUND adadadadad.com adadadadad.com:80 for GET request to http://adadadadad.com/, retry count 1
```
For rest of samples, please refer [`request-promise` documentation](https://github.com/request/request-promise).

### Installation
`npm install promise-request-retry`

### Test
`npm test`
