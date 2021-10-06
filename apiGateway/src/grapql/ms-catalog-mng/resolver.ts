import { IResolvers } from 'graphql-tools';
import mqttInstance from '../../broker';
import { map } from 'rxjs/operators';
import { buildRequestForMqtt } from '../common/MqttRequestType';


const query: IResolvers = {
    Query: {
        pricesWithArgs(root, args, context) {
            const queryType = 'MS-CATALOG-MNG_QUERY_GET-PRICES-TEST-FN-WITH-ARGS';
            const requestBody = buildRequestForMqtt('CATALOG', 'query', queryType, args);


            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data),
                // timeout(1000)
            )
                .toPromise()

        },
    }
}

export default query;