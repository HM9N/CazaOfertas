import { IResolvers } from 'graphql-tools';
import { database } from '../data/data.store';

const query : IResolvers = {
    Query: {
        prices(): any {
            return database.prices;
        }
    }
}

export default query;