const { of, filter, tap, mergeMap, defer, map, forkJoin, concat, skip } = require("rxjs");
const MqttBroker = require("../../tools/MqttBroker");

const uuidV4 = require('uuid/v4');

/**
 * @type MqttBroker
 */
const mqttBroker = require("../../services/mqtt.service")();

/**
 * @type {MongoDB}
 */
const mongoInstance = require("../../services/mongo.service").mongoDB;
// const 

let instance;

const DOMAIN_KEYS = ['CATALOG', 'CAR'];


class RequestHandlerCatalogDomain {

    start$() {
        return this.configureMqttListener$()
    }

    configureMqttListener$() {

        return this.listenMessagesFormDomain$().pipe(
            mergeMap((mqttMsg) => {

                let methodResolver$ = () => of(null);

                const queryArgs = (mqttMsg.body || {}).args || {};
                // console.log(mqttMsg.body);
                // queryType - is like an query identifier 
                switch (mqttMsg.body.requestType) {

                    case 'auth':
                        methodResolver$ = this.getObjectTest$();
                        break;

                    case 'other-case':
                        const { pass, userName } = mqttMsg.body;
                        methodResolver$ = this.getObjectTest_other_case$(pass, userName);
                        break;

                    case 'CREATE_PRODUCT':
                        const { product } = queryArgs;
                        methodResolver$ = this.createProduct$(product);
                        break;

                    case 'MS-CATALOG-MNG_QUERY_GET-PRICES-TEST-FN-WITH-ARGS':

                        methodResolver$ = this.findPricesWithArgs$(queryArgs);
                        break;

                    case 'MS-TEST-CREATE-CAR':
                        methodResolver$ = this.testCreateCar$(queryArgs);
                        break;

                    case 'MS-CATALOG-MNG_FIND_ONE_CAR_BY_ID':
                        methodResolver$ = this.testFindOneCar$(queryArgs);
                        break;

                    default:
                        methodResolver$ = of(null);
                }

                return forkJoin([
                    of(mqttMsg),
                    methodResolver$
                ])

            }),
            mergeMap(([mqttMsg, result]) => {

                const { requestId } = mqttMsg;

                console.log({ mqttMsg, result });

                return mqttBroker.sendReply$({
                    requestId,
                    data: result
                })

            }),
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

    /**
     * EXAMPLE
     * @param {*} args 
     * @returns 
     */
    testCreateCar$(args) {
        const collection = this.getCollection("ms-cars-mng", "cars");

        // build object to insert
        const carToInsert = {
            _id: uuidV4(),
            ...args.carInput,
            license: args.licenseID
        }

        return defer(() => collection.insertOne(carToInsert)).pipe(
            map(r => r.result),
            mergeMap((res) => {
                console.log("RESULTADO DE MONGO", res);
                return of({
                    code: 200,
                    result: "FELIPE_SANTA" + JSON.stringify(res)
                });
            })
        )


    }

    testFindOneCar$(args) {
        const collection = this.getCollection("ms-cars-mng", "cars");
        const query = { _id: args.id };
        return defer(() => collection.findOne(query));
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

    createProduct$(product) {
        const collection = this.getCollection("ms-catalog-mng", "product");
        return defer(() => collection.insertOne(product)).pipe(
            map(r => r.result),
            // tap(data => console.log({ data }))
        )
    }

    findPricesWithArgs$(args) {

        return of([
            {
                name: `HOLA TIEMPO 1${Date.now()}`,
                size: Math.floor(Math.random() * 100),
                encoding: JSON.stringify(args)
            },
            {
                name: `HOLA TIEMPO 2 ${Date.now()}`,
                size: Math.floor(Math.random() * 100),
                encoding: JSON.stringify(args)
            }
        ])

    }

    /**
     * REMOVE A PRODUCT
     */
    deleteProduct$(productId) {

        const collection = this.getCollection("ms-catalog-mng", "product");
        return defer(() => collection.deleteOne({ _id: productId })).pipe(
            // tap(r => console.log({ r }))
        )
    }

    updateProduct$(product) {
        const { id } = product;
        const collection = this.getCollection("ms-catalog-mng", "product");

        const query = { _id: id };
        const update = { $set: { ...product } }

        return defer(() => collection.updateOne(query, update)).pipe(
            // tap(r => console.log({ r }))
        )
    }


    updateProductState$(productId, newState) {
        const collection = this.getCollection("ms-catalog-mng", "product");

        const query = { _id: productId };
        const update = { $set: { state: newState } }

        return defer(() => collection.updateOne(query, update)).pipe(
            // tap(r => console.log({ r }))
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
            // tap(m => console.log({ MSG: m })),
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
     * @returns {RequestHandlerCatalogDomain}
     */
    getInstance: () => {
        if (!instance) {
            console.log('instance = new RequestHandlerCatalogDomain();');
            instance = new RequestHandlerCatalogDomain();
        }
        return instance
    },
    RequestHandlerCatalogDomain
}