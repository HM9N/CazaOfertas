import { IResolvers } from 'graphql-tools';
import { database } from '../data/data.store';
import mqttInstance from '../broker';
import { mergeMap, tap, map } from 'rxjs/operators';
import { of } from 'rxjs';

const uuidV4 = require('uuid/v4');

const query: IResolvers = {
    Query: {
        prices(): any {
            const requestBody = {
                requestId: uuidV4(),
                body: {
                    domain: 'user',
                    requestType: 'auth', // reset-password | operation1, operaion-n | .....
                    body: {
                        pass: '3425f344',
                        userName: 'juan.santa'
                    }
                },
            }
            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                // map((mqttMsg) => mqttMsg.data)
                map((mqttMsg) => database.prices)
            ).toPromise()

        }
    }
}

export default query;