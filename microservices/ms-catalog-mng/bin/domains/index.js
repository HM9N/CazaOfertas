"use strict";

const { concat } = require("rxjs");
const catalogInstance = require('./catalog/requestHandlers').getInstance();
// const usersInstance = require('./catalog/user.asdasdasd').getInstance();

module.exports = {
    start$: concat(
        catalogInstance.start$(),
        // usersInstance.start$
    )
}