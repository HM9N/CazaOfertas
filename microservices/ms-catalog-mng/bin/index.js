const { concat, of, tap } = require("rxjs");
const MqttBroker = require("./tools/MqttBroker");

/** @type MqttBroker */
const mqttInstance = require('./services/mqtt.service')();
const Mongo = require("./services/mongo.service");
const domains = require("./services/domains.service");

concat(
    // empezar conexion con mqtt
    mqttInstance.configMessageListener$(['requests']),
    // empezar conexcion con Mongo
    Mongo.start$,
    // empezar a escuchar los handlers
    domains.start$

).subscribe(
    (evt) => {
        console.log("server runing")
    },
    (err) => {
        console.log('error', err);
    },
    () => {
        console.log('COMPLETED');
    }
)