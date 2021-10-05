import { IResolvers } from 'graphql-tools';
import { database } from '../data/data.store';
import mqttInstance from '../broker';
import { mergeMap, tap, map, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

const uuidV4 = require('uuid/v4');

interface MqttRequest {
    requestId: string,
    body: {
        domain: string;
        requestType: string;
        queryType: string;
        args: any
    }
}

function buildRequestForMqtt(domain: string, requestType: string, queryType: string, args: any): MqttRequest {
    return ({
        requestId: uuidV4(),
        body: {
            domain,
            requestType,
            queryType,
            args
        }

    })
}

const query: IResolvers = {
    Query: {
        prices(root, args, context): any {

            const argsObj = {
                pass: '3425f344',
                userName: 'juan.santa'
            }

            const queryType = 'MS_CATALOG_MNG_QUERY_GET_PRICES_TEST_FN';
            const requestBody = buildRequestForMqtt('CATALOG', 'query', queryType, argsObj);

            // return of(database.prices).toPromise();
            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                // tap(r => console.log(r))
                map((mqttMsg) => mqttMsg.data),
                // map((mqttMsg) => database.prices)
            ).toPromise()

        },
        pricesWithArgs(root, args, context) {
            const queryType = 'MS-CATALOG-MNG_QUERY_GET-PRICES-TEST-FN-WITH-ARGS';
            const requestBody = buildRequestForMqtt('CATALOG', 'query', queryType, args);


            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data),
                // timeout(1000)
            )
                .toPromise()

        },
        products(root, args, context) {
            const queryType = 'MS_CATALOG_MNG_QUERY_GET_PRODUCTS_OFCATALOG';
            const requestBody = buildRequestForMqtt('CATALOG', 'query', queryType, args);

            return of(JSON.stringify(args)).toPromise();

        }
    }
}

export default query;