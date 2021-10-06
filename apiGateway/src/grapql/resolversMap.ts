import { IResolvers } from 'graphql-tools';
import msCatalogResolver from './ms-catalog-mng/resolver';
import msOfferResolver from './ms-offer-mng/resolver';

const resolversMap: IResolvers = {
    ...msCatalogResolver,
    ...msOfferResolver
}

export default resolversMap;