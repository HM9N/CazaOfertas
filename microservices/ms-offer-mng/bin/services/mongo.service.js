"use strict";

const mongoDB = require("../tools/MongoDB").singleton();

module.exports = {
    start$: mongoDB.start$(),
    mongoDB
}

