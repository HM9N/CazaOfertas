import 'graphql-import-node';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolversMap';
import { mergeTypes, fileLoader } from 'merge-graphql-schemas'
import * as path from 'path';

const typesArray = fileLoader(
    path.join(__dirname, '.'),
    { extensions: ['.graphql', '.graphqls', '.gql'], recursive: true }
);

const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs: mergeTypes(typesArray, { all: true }),
    resolvers //: mergeResolvers(resolversArray)
});

export default schema;