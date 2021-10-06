const uuidV4 = require('uuid/v4');


export interface MqttRequest {
    requestId: string,
    body: {
        domain: string;
        requestType: string;
        args: any
    }
}

export function buildRequestForMqtt(domain: string, requestType: string, args: any): MqttRequest {
    return ({
        requestId: uuidV4(),
        body: {
            domain,
            requestType,
            args
        }

    })
}
