const { of, filter, tap, mergeMap, defer, map } = require("rxjs");
const MqttBroker = require("../../tools/MqttBroker");

/**
 * @type MqttBroker
 */
const mqttBroker = require("../../services/mqtt.service")();

/**
 * @type MongoDB
 */
const mongoInstance = require("../../services/mongo.service").mongoDB;
let instance;



class RequestHandlerCatalogDomain {

    start$() {
        return mqttBroker.incomingMessages$.pipe(
            filter(m => m),
            filter(msg => msg.data && msg.data.domain === 'CATALOG'),
            tap(msg => {
                console.log('mensaje recibido por el dominio de catalog (-.-)');
            }),
            mergeMap(() => {
                return this.getObjectTest$()
            }),
            mergeMap(response => {

                return mqttBroker.sendReply$({ requestId: "123-23wew", data: response })

            })
        )

    }


    getObjectTest$() {
        // this.client.db(this.dbName)
        const collection = mongoInstance.client.db("testing").collection("courses");
        const query = {};
        return defer(() => collection.findOne(query)).pipe(
            map(res => {
                return { timestamp: Date.now(), ...res }
            })
        )

    }



}

module.exports = {
    /**
     * 
     * @returns RequestHandlerCatalogDomain
     */
    getInstance: () => {
        if (!instance) {
            instance = new RequestHandlerCatalogDomain();
        }
        return instance
    },
    RequestHandlerCatalogDomain
}