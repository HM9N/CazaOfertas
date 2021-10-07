const { of, defer, forkJoin } = require("rxjs");
const { filter, tap, mergeMap, map } = require("rxjs/operators");
const MqttBroker = require("../../tools/MqttBroker");
const uuidv4 = require('uuid/v4');

/**
 * @type MqttBroker
 */
const mqttBroker = require('../../services/mqtt.service')();

/**
 * @type {MongoDB}
 */
const mongoInstance = require('../../services/mongo.service').mongoDB;

let instance; 

const DOMAIN_KEYS = ['STORE'];

class RequestHandlerStoreDomain {

    start$(){
        return this.configureMqttListener$()
    }

    configureMqttListener$(){

        return this.listenMessagesFormDomain$().pipe(
            mergeMap((mqttMsg) =>{

                let methodResolver$ = () => of(null);

                const queryArgs = (mqttMsg.body || {}).args || {};

                //console.log("###################################", mqttMsg.body.requestType);

                switch(mqttMsg.body.requestType){

                    case 'MS-STORE-MNG_CREATE_STORE':
                        //const { store } = queryArgs;
                        methodResolver$ = this.createStore$(queryArgs);
                        break;

                    case 'MS-STORE-MNG_FIND_ONE_STORE_BY_ID':
                        //const { storeId } = queryArgs;
                        methodResolver$ = this.searchStoreById$(queryArgs);
                        break;

                    case 'MS-STORE-MNG_FIND_ONE_STORE_BY_KEYWORD':
                        //const { keyword } = queryArgs;
                        methodResolver$ = this.searchStoreByKeyword$(queryArgs);
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

                const {requestId, requestType} = mqttMsg;
                
                console.log({mqttMsg, result});

                return mqttBroker.sendReply$({
                    requestId,
                    data: result
                })
            }),
            tap(() => {
                console.log('[3] configurando listener de store')
            })
        )
    }

    //Create a new store in the aplication...
    createStore$(args){
        const collection = this.getCollection("ms-store-mng", "store");

        //Building a object to insert
        const storeToInsert = {
            _id: uuidv4(),
            ...args.storeInput,
        }

        return defer(() => collection.insertOne(storeToInsert)).pipe(
            map(r => r.result),
            mergeMap((res) => {
                return of({
                    code: 200,
                    result: "¡Se ha registrado éxitosamente la tienda!" + JSON.stringify(res)
                });
            })
        )
    }

    //Buscar una tienda por id
    searchStoreById$(args){
        const collection = mongoInstance.client
            .db("ms-store-mng")
            .collection("store");
        const query = {"_id": args.id};
        return defer(() => collection.findOne(query))
    }

    //Buscar tienda por keyword
    searchStoreByKeyword$(args){
        const collection = mongoInstance.client
            .db("ms-store-mng")
            .collection("store");
        
        const query = {"name": {$regex: args.keyword, $options: 'i'}};

        return defer(() => collection.find(query).toArray());
    }

    listenMessagesFormDomain$() {

        return mqttBroker.incomingMessages$.pipe(
            filter(m => m),
            filter(msg => msg.data && msg.data.body && DOMAIN_KEYS.includes(msg.data.body.domain)),
            map(msg => msg.data),
            tap(m => console.log({ MSG: m })),
        );
    }

    getCollection(dbName, collectionName){
        return mongoInstance.client
            .db(dbName)
            .collection(collectionName)
    }
}

module.exports = {
    /**
     * @returns {RequestHandlerStoreDomain}
     * 
     */

    getInstance: () => {
        if(!instance){
            console.log('instance = new RequestHandlerStoreDomain();');
            instance = new RequestHandlerStoreDomain();
        }
        return instance;
    },
    RequestHandlerStoreDomain
}