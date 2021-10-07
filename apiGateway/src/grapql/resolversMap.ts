import { IResolvers } from 'graphql-tools';
import msCatalogResolver from './ms-catalog-mng/resolver';
import msOfferResolver from './ms-offer-mng/resolver';

const resolversMap = {

    Query: {
        ...msCatalogResolver.Query,
        ...msOfferResolver.Query
    },
    Mutation: {
        ...msCatalogResolver.Mutation,
        ...msOfferResolver.Mutation
    }
}

// console.log({ resolversMap });

export default resolversMap;