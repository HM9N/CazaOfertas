const { of, filter, tap, mergeMap, defer, map, forkJoin } = require("rxjs");
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

const DOMAIN_KEY = 'CATALOG';

class RequestHandlerCatalogDomain {

    start$() {
        return this.listenMessagesFormDomain$().pipe(
            mergeMap((mqttMsg) => {

                let methodResolver$ = of(null);

                switch (mqttMsg.body.requestType) {
                    case 'auth':
                        methodResolver$ = this.getObjectTest$();
                        break;
                    case 'other-case':
                        const { pass, userName } = mqttMsg.body;
                        methodResolver$ = this.getObjectTest_other_case$(pass, userName);
                        break;
                    default:
                        methodResolver$ = of(null);
                }

                return forkJoin([
                    of(mqttMsg),
                    methodResolver$
                ])

            }),
            mergeMap(([mqttMsg, mongoData]) => {

                const { requestId, requestType } = mqttMsg;

                console.log({ mqttMsg, mongoData });

                return mqttBroker.sendReply$({
                    requestId,
                    data: mongoData
                })

            })
        )

    }


    // get all products.....
    getObjectTest$() {
        // this.client.db(this.dbName)
        const collection = mongoInstance.client
            .db("ms-catalog-mng")
            .collection("catalogs");
        const query = { "_id": "1238y1273y12s31_" };
        return defer(() => collection.findOne(query)).pipe(
            map(doc => (doc || {}).offers || [])
        )

    }

    // get product wit discpunt
    getObjectTest_other_case$(pass, userName) {
        // this.client.db(this.dbName)
        const collection = mongoInstance.client
            .db("ms-catalog-mng")
            .collection("catalogs");
        const query = { "_id": "1238y1273y12s31" };
        return defer(() => collection.findOne(query)).pipe(
            map(doc => (doc || {}).offers || [])
        )

    }

    listenMessagesFormDomain$() {

        return mqttBroker.incomingMessages$.pipe(
            filter(m => m),
            filter(msg => msg.data && msg.data.body && msg.data.body.domain === DOMAIN_KEY),
            map(msg => msg.data),
        );
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