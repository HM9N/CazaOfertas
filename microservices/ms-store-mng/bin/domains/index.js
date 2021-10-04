"use strict"

const {concat} = require("rxjs");
const storeInstance = require('./store/requestHandlers').getInstance();

module.exports = {
    start$: concat(
        storeInstance.start$(),
    )
}