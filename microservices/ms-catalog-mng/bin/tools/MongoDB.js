"use strict";

const { bindNodeCallback, Observable } = require("rxjs");
const { map } = require("rxjs/operators");
const MongoClient = require("mongodb").MongoClient;

let instance = null;

class MongoDB {

    constructor({ url, dbName }) {
        this.url = url;
        this.dbName = dbName;
    }

    start$() {
        return bindNodeCallback(MongoClient.connect)(this.url,
            {
                // retry to connect for 60 times
                reconnectTries: 4,
                // wait 1 second before retrying
                reconnectInterval: 250
            }).pipe(
                map(client => {
                    console.log('CONECTADO A MONGO');
                    this.client = client;
                    this.db = this.client.db(this.dbName);
                    return `MongoDB connected to dbName= ${this.dbName}`;
                })
            );
    }
}

module.exports = {
    MongoDB,
    singleton: () => {
        if (!instance) {
            instance = new MongoDB({ url: 'mongodb://localhost:27018', dbName: 'test' })
        }
        return instance;
    }
}