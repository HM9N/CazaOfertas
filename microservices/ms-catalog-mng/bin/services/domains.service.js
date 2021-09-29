"use strict"

const { concat } = require("rxjs");

// const catalogDomain = require("../domains/catalog/requestHandlers").getInstance();
const domains = require('../domains');

module.exports = {
    start$: concat(
        domains.start$
    )
}