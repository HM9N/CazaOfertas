"use strict"

const { defer, Observable } = require('rxjs');

const DB_NAME = 'ms-offer-mng';
const COLLECTION_NAME = 'offers';

let mongoDB;

class OfferDA {

    static start$() {
        return new Observable(observer => {
            mongoDB = require('../../tools/MongoDB').singleton();
            observer.next('creando la instancia de mongo');
            observer.next('-$$$$$$$$$$$$$$$$$   catalogDA sttarted $$$$$$$$$$$$$$$$$');
            observer.complete();
        })
    }

    static createProduct$(product) {
        return defer(() => this.collection.insertOne(product))
    }

}

module.exports = {
    OfferDA
}