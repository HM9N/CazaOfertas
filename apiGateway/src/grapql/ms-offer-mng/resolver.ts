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

    }
}

export default query;