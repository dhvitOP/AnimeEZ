'use strict';
const requestPromise = require('request-promise');
const Promise = require('bluebird');
const logger = require('./modules/logger')('request-promise-retry');

class rpRetry {
    static _rpRetry(options) {
        if (options.verbose_logging) {
            logger.info(`calling ${options.uri} with retry ${options.retry}`);
        }
        const tries = options.retry || 1;
        delete options.retry;

        const delay = options.delay || 100; // default ms delay between retries
        delete options.delay;

        const factor = options.factor || 1; // If absent, delay will always be the same.
        delete options.factor;

        if (options.verbose_logging) {
            logger.info(`calling ${options.uri} with retry ${tries}, initial delay=${delay}, factor=${factor}`);
        }

        const fetchDataWithRetry = (tryCount, delay) => {
            return requestPromise(options)
                .then(result => {
                    if (options.verbose_logging) {
                        logger.info(`Result obtained for ${options.method} request to ${options.uri}`);
                    }
                    return Promise.resolve(result);
                })
                .catch(err => {
                    err.accepted = false;
                    if (options.accepted && options.accepted.indexOf(err.statusCode) > -1) {
                        err.accepted = true;
                        return Promise.reject(err);
                    }

                    logger.info(`Encountered error ${err.message} for ${options.method} request to ${options.uri}, retry count ${tryCount}`);
                    tryCount -= 1;
                    if (tryCount) {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                logger.debug(`waiting for ${delay} ms before next retry for ${options.uri}. Next wait ${delay * factor}`);
                                resolve(fetchDataWithRetry(tryCount, delay * factor));
                            }, delay);
                        });
                    }
                    return Promise.reject(err);
                });
        };
        return fetchDataWithRetry(tries, delay);
    }

    static _rp(options) {
        if (options.verbose_logging) {
            logger.info(`calling ${options.uri} without retries`);
        }
        return requestPromise(options)
            .then(result => {
                if (options.verbose_logging) {
                    logger.info(`Result obtained for ${options.method} request to ${options.uri}`);
                }
                return Promise.resolve(result);
            })
            .catch(err => {
                logger.info(`Encountered error ${err.message} for ${options.method} request to ${options.uri}`);
                return Promise.reject(err);
            });
    }

    static rp(options) {
        if (options.retry) {
            if (typeof options.retry === 'number') {
                if (options.retry < 0) {
                    return Promise.reject(new Error(`Retry count must be positive integer`));
                }
                return rpRetry._rpRetry(options);
            } else if (typeof options.retry === 'boolean') {
                options.retry = 1;
                return rpRetry._rpRetry(options);
            } else {
                return Promise.reject(new Error(`Supports boolean or positive integer`));
            }
        }
        return rpRetry._rp(options);
    }
}

module.exports = rpRetry.rp;
