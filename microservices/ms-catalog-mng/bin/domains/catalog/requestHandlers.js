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

                switch (mqttMsg.body.requestType) {
                    case 'other-case':
                        const { pass, userName } = mqttMsg.body;
                        methodResolver$ = this.getObjectTest_other_case$(pass, userName);
                        break;

                    case 'MS-CATALOG-MNG_MUTATION_CREATE_PRODUCT':
                        console.log(queryArgs);
                        const product = queryArgs;
                        methodResolver$ = this.createProduct$(product);
                        break;

                    case 'MS-CATALOG-MNG_MUTATION_EDIT_PRODUCT':
                        const productToUpdate  = queryArgs;
                        methodResolver$ = this.updateProduct$(productToUpdate);
                        break;

                    case 'MS-CATALOG-MNG_QUERY_SEARCH_PRODUCT':
                        methodResolver$ = this.searchProduct$(queryArgs.keyword);
                        break;
                    
                    case 'MS-CATALOG-MNG_MUTATION_DELETE_PRODUCT':
                        methodResolver$ = this.deleteProduct$(queryArgs.productRef);
                        break;
                    
                    case 'MS-CATALOG-MNG_MUTATION_CREATE_CATALOG':
                        console.log(queryArgs);
                        const catalog = queryArgs;
                        methodResolver$ = this.createCatalog$(catalog);
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

                return mqttBroker.sendReply$({
                    requestId,
                    data: result
                })

            }),
        )
    }
    // get all products.....
    searchProduct$(keyword) {
        const collection = mongoInstance.client
            .db("ms-catalog-mng")
            .collection("products");
            const query = { "name":  { $regex: keyword, $options: 'i' }}; 
            return defer(() => collection.find(query).toArray());
    }

    createProduct$(product) {
<<<<<<< HEAD
        const collection = this.getCollection("ms-catalog-mng", "products");
        const productToInsert = product.productInput;
        productToInsert._id = uuidV4();
        return defer(() => collection.insertOne(productToInsert)).pipe(
=======
        const collection = this.getCollection("ms-catalog-mng", "product");
        return defer(() => collection.insertOne(product)).pipe(
>>>>>>> fb92d8babfed4ab5783193e0d9bd2ed353dcbb7e
            map(r => r.result)
        )
    }

    createCatalog$(catalog) {
        const collection = this.getCollection("ms-catalog-mng", "catalogs");
        console.log(catalog);
        const catalogToInsert = catalog.catalogInput;
        console.log(catalogToInsert);
        catalogToInsert._id = uuidV4();
        return defer(() => collection.insertOne(catalogToInsert)).pipe(
            map(r => r.result)
        )
    }

    /**
     * REMOVE A PRODUCT
     */
    deleteProduct$(productRef) {

        const collection = this.getCollection("ms-catalog-mng", "products");
        return defer(() => collection.deleteOne({ ref: productRef })).pipe(
            tap(doc => console.log(doc))
        )
    }

    updateProduct$(product) {
        const { ref } =  product.productInput;
        const collection = this.getCollection("ms-catalog-mng", "products");
        const producToUpdate = product.productInput;
        const query = { ref: ref };
        const update = { $set: { ...producToUpdate } }

        return defer(() => collection.updateOne(query, update)).pipe(
            tap(r => console.log(r))
        )
    }

    updateProductState$(productId, newState) {
        const collection = this.getCollection("ms-catalog-mng", "product");

        const query = { _id: productId };
        const update = { $set: { state: newState } }

        return defer(() => collection.updateOne(query, update)).pipe(
             tap(doc => console.log({ doc }))
        )
    }

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