import { IResolvers } from 'graphql-tools';
import mqttInstance from '../../broker';
import { map } from 'rxjs/operators';
import { buildRequestForMqtt, MqttRequest } from '../common/MqttRequestType';
import { of } from 'rxjs';

const query: IResolvers = {
    Query: {
        getCatalogTest(root, args, context) {
            return of({
                id: "prueba",
                products: [],
                offers: []
            }).toPromise()
        },
    },
    Mutation: {
        createOffer(root, args, context){
            const requestType = 'MS-OFFER_MNG_CREATE_OFFER';
            const requestBody = buildRequestForMqtt('OFFER', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data)
            ).toPromise();
        }
    }
}

export default query;