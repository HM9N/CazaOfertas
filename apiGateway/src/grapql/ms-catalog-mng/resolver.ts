import { IResolvers } from 'graphql-tools';
import mqttInstance from '../../broker';
import { map, tap } from 'rxjs/operators';
import { buildRequestForMqtt } from '../common/MqttRequestType';
import { of } from 'rxjs';


const query: IResolvers = {
    Query: {
        searchProduct(root, args, context) {

            const requestType = 'MS-CATALOG-MNG_QUERY_SEARCH_PRODUCT';
            const requestBody = buildRequestForMqtt('CATALOG', requestType, args);
            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data)
            ).toPromise()
        },
        msCatalogSearchCatalogByStoreId(root, args, context){

            const requestType = 'MS-CATALOG-MNG_FIND_CATALOG_BY_STORE_ID';
            const requestBody = buildRequestForMqtt('CATALOG', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data),
            ).toPromise();
        },
        removeProductFromCatalog(root, args, context){

            const requestType = 'MS-CATALOG-MNG_REMOVE_PRODUCT_FROM_CATALOG';
            const requestBody = buildRequestForMqtt('CATALOG', requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                map((mqttMsg) => mqttMsg.data),
            ).toPromise();
        }
    },
    Mutation: {
        createProduct(root, args, context) {
            const requestType = "MS-CATALOG-MNG_MUTATION_CREATE_PRODUCT";
            const requestBody = buildRequestForMqtt("CATALOG", requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                tap(res => console.log(res))
               // map(res => res.data)
            ).toPromise();
        },
        editProduct(root, args, context) {
            const requestType = "MS-CATALOG-MNG_MUTATION_EDIT_PRODUCT";
            const requestBody = buildRequestForMqtt("CATALOG", requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                tap(res => console.log(res))
               // map(res => res.data)
            ).toPromise();
        },
        deleteProduct(root, args, context) {
            const requestType = "MS-CATALOG-MNG_MUTATION_DELETE_PRODUCT";
            const requestBody = buildRequestForMqtt("CATALOG", requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                tap(res => console.log(res))
               // map(res => res.data)
            ).toPromise();
        },
        createCatalog(root, args, context) {
            const requestType = "MS-CATALOG-MNG_MUTATION_CREATE_CATALOG";
            const requestBody = buildRequestForMqtt("CATALOG", requestType, args);

            return mqttInstance.publishAndGetResponse$('requests', requestBody).pipe(
                tap(res => console.log(res))
               // map(res => res.data)
            ).toPromise();
        }
    }
}

export default query;