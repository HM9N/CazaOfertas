import { IResolvers } from 'graphql-tools';
import msCatalogResolver from './ms-catalog-mng/resolver';
import msOfferResolver from './ms-offer-mng/resolver';
import msStoreResolver from './ms-store-mng/resolver';

const resolversMap = {

    Query: {
        ...msCatalogResolver.Query,
        ...msOfferResolver.Query,
        ...msStoreResolver.Query,
    },
    Mutation: {
        ...msCatalogResolver.Mutation,
        ...msOfferResolver.Mutation,
        ...msStoreResolver.Mutation,
    }
}

// console.log({ resolversMap });

export default resolversMap;