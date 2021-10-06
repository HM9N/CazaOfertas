'use strict';

const MQTT = require('async-mqtt');
const { defer, from, BehaviorSubject, of } = require('rxjs');
const uuidv4 = require('uuid/v4');

const { mergeMap, tap } = require('rxjs/operators');

class MqttBroker {

    constructor({ serverUrl, replyTimeout, port = null }) {
        this.serverUrl = serverUrl;
        this.replyTimeout = replyTimeout;
        this.port = port;

        this.senderId = uuidv4();
        this.clientId = `ms_catalog_mng_${uuidv4()}`;


        /**
         * Rx Subject for incoming messages
         */
        this.incomingMessages$ = new BehaviorSubject();

        this.listeningTopics = ['requests', 'events'];
        this.repliesTopic = "responses";

        this.mqttClient = MQTT.connect(this.mqttServerUrl, {
            host: this.mqttServerUrl,
            port: this.port,
            clientId: this.clientId,
            // username: this.auth.user,
            // password: this.auth.password,
            protocol: "tcp",
            protocolVersion: 4
        });

        this.mqttClient.on('connect', () => console.log(` ------- Mqtt client connected ----------`));

        this.mqttClient.on('message', (topic, message) => {
            const parsedMsg = JSON.parse(message);
            //console.log(JSON.stringify(parsedMsg));
            this.incomingMessages$.next({
                id: parsedMsg.id,
                data: parsedMsg,
                topic
            });

        });

        // this.mqttClient.subscribe('requests').then(() => {
        //     console.log('subcrito a requests');
        // });

        // this.configMessageListener$(this.listeningTopics).subscribe();

    }

    configMessageListener$(topics) {
        return from(topics).pipe(
            mergeMap(topic =>
                defer(() => this.mqttClient.subscribe(topic)).pipe(
                    tap(() => console.log(`[1] Subscrito a ${topic}`))
                )
            )
        )
    }

    sendReply$(data) {

        const responseAsString = JSON.stringify(data);

        return of(null).pipe(
            mergeMap(() => defer(() => this.mqttClient.publish(this.repliesTopic, responseAsString, { qos: 0 })))

        )


    }



}

module.exports = MqttBroker;