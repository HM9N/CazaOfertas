const { of, defer, forkJoin } = require("rxjs");
const { filter, tap, mergeMap, map } = require("rxjs/operators");
const MqttBroker = require("../../tools/MqttBroker");

/**
 * @type MqttBroker
 */
const mqttBroker = require('../../services/mqtt.service')();

/**
 * @type MongoDB
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

                switch(mqttMsg.body.requestType){

                    case 'CREATE_STORE':
                        const { store } = mqttMsg.body.args;
                        methodResolver$ = this.registerStore$(store);
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

                const {requestId, requestType} = mqttMsg;
                
                console.log({mqttMsg, mongoData});

                return mqttBroker.sendReply$({
                    requestId,
                    data: mongoData
                })
            }),
            tap(() => {
                console.log('[3] configurando listener de store')
            })
        )
    }

    //Register a new store in the aplication...
    registerStore$(store){
        return of(store);
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