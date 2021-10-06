import { IResolvers } from 'graphql-tools';
import mqttInstance from '../../broker';
import { map, tap } from 'rxjs/operators';
import { buildRequestForMqtt } from '../common/MqttRequestType';
import { of } from 'rxjs';


const query: IResolvers = {
    Query: {
        pricesWithArgs(root, args, context) {
            const requestType = 'MS-CATALOG-MNG_QUERY_GET-PRICES-TEST-FN-WITH-ARGS';
            const requestBody = buildRequestForMqtt('CATALOG', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data),
                // timeout(1000)
            )
                .toPromise()

        },
        findCarById(root, args, context) {

            const requestType = 'MS-CATALOG-MNG_FIND_ONE_CAR_BY_ID';
            const requestBody = buildRequestForMqtt('CAR', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data)
            ).toPromise()
        }
    },
    Mutation: {
        mutationTest(root, args, context) {
            return of({
                code: 200,
                result: JSON.stringify(args)
            }).toPromise()
        },
        createCar(root, args, context) {

            const requestType = "MS-TEST-CREATE-CAR";
            const requestBody = buildRequestForMqtt("CAR", requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                // tap(res => console.log(res))
                map(res => res.data)
            ).toPromise();
        },
    }
}

export default query;