"use strict"

const { defer, Observable } = require('rxjs');

const DB_NAME = 'ms-catalog-mng';
const COLLECTION_NAME = 'products';

let mongoDB;

class CatalogDA {

    static start$() {
        return new Observable(observer => {
            mongoDB = require('../../tools/MongoDB').singleton();
            observer.next('creando la instancia de mongo');
            observer.complete();
        })
    }

    static createProduct$(product) {
        return defer(() => this.collection.insertOne(product))
    }

}

module.exports = {
    CatalogDA
}