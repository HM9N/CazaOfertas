const { of, filter, tap, mergeMap, defer, map, forkJoin, concat, skip } = require("rxjs");
const MqttBroker = require("../../tools/MqttBroker");

/**
 * @type MqttBroker
 */
const mqttBroker = require("../../services/mqtt.service")();

/**
 * @type MongoDB
 */
const mongoInstance = require("../../services/mongo.service").mongoDB;
// const 

let instance;

const DOMAIN_KEYS = ['OFFER'];


class RequestHandlerOfferDomain {

    start$() {
        return this.configureMqttListener$()
    }

    configureMqttListener$() {

        return this.listenMessagesFormDomain$().pipe(
            mergeMap((mqttMsg) => {

                let methodResolver$ = () => of(null);

                switch (mqttMsg.body.requestType) {


                    case 'CREATE_PRODUCT':
                        const { product } = mqttMsg.body.args;
                        methodResolver$ = this.createProduct$(product);
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

            }),
            tap(() => {
                console.log('[3] configurando listener de catalog')
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

    /* createProduct$(product) {
        const collection = this.getCollection("ms-catalog-mng", "product");
        return defer(() => collection.insertOne(product)).pipe(
            map(r => r.result),
            tap(data => console.log({ data }))
        )
    } */

    createProduct$(product) {
        console.log("Holaaaaaaaa" + product);
        return of(product);
    }


    /**
     * REMOVE A PRODUCT
     */
    deleteProduct$(productId) {

        const collection = this.getCollection("ms-catalog-mng", "product");
        return defer(() => collection.deleteOne({ _id: productId })).pipe(
            tap(r => console.log({ r }))
        )
    }

    updateProduct$(product) {
        const { id } = product;
        const collection = this.getCollection("ms-catalog-mng", "product");

        const query = { _id: id };
        const update = { $set: { ...product } }

        return defer(() => collection.updateOne(query, update)).pipe(
            tap(r => console.log({ r }))
        )
    }


    updateProductState$(productId, newState) {
        const collection = this.getCollection("ms-catalog-mng", "product");

        const query = { _id: productId };
        const update = { $set: { state: newState } }

        return defer(() => collection.updateOne(query, update)).pipe(
            tap(r => console.log({ r }))
        )
    }


    // arroz, 0, 10
    listProducts$(keyword, pagination, jwt) {

        const collection = this.getCollection("ms-catalog-mng", "product");

        const query = {};
        const { page, size } = pagination;

        query['name'] = { $regex: keyword, $options: 'i' };
        query['state'] = 'active';
        query['owner'] = jwt.userName;

        return defer(() => collection
            .find(query, { projection: { price: 1, name: 1, category: 1 } })
            .skip(page * size)
            .limit(size)
            .toArray()
        );

    }

    listenMessagesFormDomain$() {
        return mqttBroker.incomingMessages$.pipe(
            filter(m => m),
            filter(msg => msg.data && msg.data.body && DOMAIN_KEYS.includes(msg.data.body.domain)),
            map(msg => msg.data),
            tap(m => console.log({ MSG: m })),
        );
    }

    getCollection(dbName, collectionName) {
        return mongoInstance.client
            .db(dbName)
            .collection(collectionName)
    }
}

module.exports = {
    /**
     * 
     * @returns {RequestHandlerOfferDomain}
     */
    getInstance: () => {
        if (!instance) {
            console.log('instance = new RequestHandlerCatalogDomain();');
            instance = new RequestHandlerOfferDomain();
        }
        return instance
    },
    RequestHandlerOfferDomain
}