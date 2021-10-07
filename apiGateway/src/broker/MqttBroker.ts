import { of, BehaviorSubject, from, defer, bindCallback, bindNodeCallback, Observable } from 'rxjs';
import { map, filter, reduce, mergeMap, switchMap, tap, catchError, take } from 'rxjs/operators';
import * as MQTT from 'mqtt';
const uuidv4 = require('uuid/v4');

let instance: any;

export class MqttBroker {

    url: string;
    port: number;
    clientId: string;
    user: string;
    password: string;
    senderId: string;
    listeningTopics: string[];

    mqttClient: any;

    incomingMessages$: BehaviorSubject<any>;

    constructor({ url, port, clientId, user, password }: any) {
        this.url = url;
        this.port = port;
        this.clientId = `api_gateway_${uuidv4()}`;
        this.user = user;
        this.password = password;
        this.senderId = `api_gateway_${uuidv4()}`;


        /**  MQTT Client **/
        this.listeningTopics = [
            "responses"
        ];

        /** Rx Subject for incoming messages */
        this.incomingMessages$ = new BehaviorSubject<any>(null);

        this.mqttClient = MQTT.connect(this.url, {
            host: this.url,
            port: this.port,
            // path: '/mqtt',
            clientId: this.clientId,
            username: this.user,
            password: this.password,
            protocol: "tcp",
            protocolVersion: 4
        });

        console.log('######### MQTT Broker Config  #########');
        console.log({ url, user, password, port })
        console.log('######### MQTT Broker Config  #########');

        this.mqttClient.on('connect', () => {
            console.log(`MqttBroker Mqtt connected: ${this.url}:${this.port} { clientId:${this.clientId}, username:${this.user} }`)
        });

        this.mqttClient.on('reconnect', () => console.log(`Mqtt client reconnecting`));
        this.mqttClient.on('error', (error: any) => console.log(`Mqtt Error =>`, error));
        this.mqttClient.on('disconnect', (packet: any) => console.log(`Mqtt disconnect =>`, packet));
        this.mqttClient.on('close', () => console.log(`Mqtt closed connection`));

        this.mqttClient.on('message', (topicName: string, message: string) => {
            console.log(`${Date.now()} --- ${message.toString()} \n \n`);
            const msg = JSON.parse(message);
            // message is Buffer
            this.incomingMessages$.next({
                id: msg.id,
                data: msg,
                topic: topicName
            });
        });


        this.mqttClient.on('error', (arg1: any) => { console.error(`error: ${JSON.stringify(arg1)}`) });

        this.listeningTopics.forEach(topic => {
            this.mqttClient.subscribe(topic, { qos: 1 });
            console.log(`======>>  MqttBroker Mqtt listenning to ${topic}`);
        });


    }

    /**
     * Returns an Observable that will emit any message
     * @param {string[] ?} topics topic to listen
     * @param {boolean ?} ignoreSelfEvents 
     */
    listenEvents$() {
        return this.incomingMessages$.pipe(
            filter(msg => msg),
            filter(msg => msg.topic === "events"),
            map(e => e.data)
        )
    }

    publichMessage$(topic: string, body: string) {
        return defer(() => {
            return new Promise((resolve, reject) => {
                this.mqttClient.publish(topic, JSON.stringify(body), {}, (error: any) => {
                    if (error) reject(error);
                    resolve("OK")
                })
            })
        })
    }

    publishAndGetResponse$(topic: string, body: any): Observable<{ requestId: string, data: any }> {
        return defer(() => {
            return new Promise((resolve, reject) => {
                this.mqttClient.publish(topic, JSON.stringify(body), {}, (error: any) => {
                    if (error) reject(error);
                    resolve("OK")
                })
            })
        }).pipe(
            switchMap(() => this.incomingMessages$),
            filter(msg => msg),
            filter(msg => msg.topic === "responses"),
            filter(msg => msg.data.requestId == body.requestId),
            map(msg => msg.data),
            take(1)
        )
    }

    indexOfAll(array: string[], searchItem: any) {
        let i = array.indexOf(searchItem)
        let indexes = [];
        while (i !== -1) {
            indexes.push(i);
            i = array.indexOf(searchItem, ++i);
        }
        return indexes;
    }



    /**
    * Config the broker to listen to several topics
    * Returns an observable that resolves to a stream of subscribed topics
    * @param {Array} topics topics to listen
    */
    configMessageListener$(topics: string[]) {
        return from(topics)
            .pipe(
                filter(topic => this.listeningTopics.indexOf(topic) === -1),
                map(topic => {
                    this.mqttClient.subscribe(topic, { qos: 1 });
                    this.listeningTopics.push(topic);
                    return topic
                }),
                reduce((acc: string[], topic: string) => {
                    acc.push(topic);
                    return acc;
                }, [])
            );
    }

    /**
    * Disconnect the broker and return an observable that completes when disconnected
    */
    disconnectBroker$() {
        return defer(() => this.mqttClient.end());
    }

}


/**
 * @returns { MqttBroker }
 */
export function getInstance() {
    if (!instance) {
        const portEnv: string = process.env.DEVICE_BROKER_PORT || '';
        instance = new MqttBroker(
            {
               // url: 'broker-mqtt-service',
                url: 'localhost',
                port: 1883, // parseInt(portEnv, 10),
                user: process.env.DEVICE_BROKER_USENAME,
                password: process.env.DEVICE_BROKER_PASSWORD,
                topic: process.env.DEVICE_BROKER_TOPIC
            }
        );
        console.log(`${instance.constructor.name} Singleton created`);
    }
    return instance;
}