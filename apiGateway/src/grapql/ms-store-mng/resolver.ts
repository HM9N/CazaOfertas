import { IResolvers } from 'graphql-tools';
import mqttInstance from '../../broker';
import { map, tap } from 'rxjs/operators';
import { buildRequestForMqtt } from '../common/MqttRequestType';
import { of } from 'rxjs';


const query: IResolvers = {
    Query: {
        findStoreById(root, args, context){

            const requestType = 'MS-STORE-MNG_FIND_ONE_STORE_BY_ID';
            const requestBody = buildRequestForMqtt('STORE', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data)
            ).toPromise();
        },
        findStoreByKeyword(root, args, context){

            const requestType = 'MS-STORE-MNG_FIND_ONE_STORE_BY_KEYWORD';
            const requestBody = buildRequestForMqtt('STORE', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data)
            ).toPromise();
        }
    },
    Mutation: {
        createStore(root, args, context){
            const requestType = 'MS-STORE-MNG_CREATE_STORE';
            const requestBody = buildRequestForMqtt('STORE', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data)
            ).toPromise();
        }
    }
}

export default query;