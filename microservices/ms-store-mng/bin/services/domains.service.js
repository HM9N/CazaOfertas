"use strict";
const {concat} = require("rxjs");

const domains = require('../domains');

module.exports = {
    start$: concat(
        domains.start$
    )
}