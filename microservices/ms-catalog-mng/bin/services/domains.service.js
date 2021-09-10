"use strict"

const { concat } = require("rxjs");
/**
 * @type RequestHandlerCatalogDomain
 */
const catalogDomain = require("../domains/catalog/requestHandlers").getInstance();

// const domains = [catalogDomain]


module.exports = {
    start$: concat(
        catalogDomain.start$()
    )
}