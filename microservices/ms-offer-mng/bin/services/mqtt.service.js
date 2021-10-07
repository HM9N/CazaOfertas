const MqttBroker = require("../tools/MqttBroker");

let instance = null;

function createIntance() {
    return new MqttBroker({
        serverUrl: 'broker-mqtt-service', //'localhost', 
        replyTimeout: 1000,
        port: 1883
    })
}

/**
 * @returns MqttBroker
 */
module.exports = () => {
    if (!instance) {
        instance = createIntance();
    }
    return instance;
}