const { concat,of, defer, forkJoin } = require("rxjs");
const { filter, tap, mergeMap, map } = require("rxjs/operators");
const MqttBroker = require("./tools/MqttBroker");

/** @type MqttBroker */
const mqttInstance = require('./services/mqtt.service')();
const Mongo = require('./services/mongo.service');
const domains = require('./services/domains.service');

concat(

    //Empezar conexión con MQTT
    mqttInstance.configMessageListener$(['requests']),

    //Empezar conexión con MONGO
    Mongo.start$,

    //Empezar a escuchar los handlerss
    domains.start$
    
).subscribe(
    (evt) => {
        console.log("Server running")
    },
    (err) => {
        console.log("Error", err);
    },
    () => {
        console.log('COMPLETED');
    }
)