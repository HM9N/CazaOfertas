"use strict";

const { concat } = require("rxjs");
const offerInstance = require('./offer/requestHandlers').getInstance();
// const usersInstance = require('./catalog/user.asdasdasd').getInstance();

module.exports = {
    start$: concat(
        offerInstance.start$(),
        // usersInstance.start$
    )
}