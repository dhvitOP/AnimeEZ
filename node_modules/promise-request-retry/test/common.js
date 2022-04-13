'use strict';

const Chai = require('chai');
const ChaiSubset = require('chai-subset');// "containSubset" object properties matcher for Chai assertion library
global.expect = Chai.expect;
Chai.use(ChaiSubset);
