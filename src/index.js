import { graphql } from 'graphql';
import createGraphQlSchema from './createGraphQlSchema';

export default class MongoQL {
  constructor (jsonSchema, mongoDbObject) {
    this.graphQlSchema = createGraphQlSchema(jsonSchema, mongoDbObject);
  }

  query (queryString, params) {
    return graphql(this.graphQlSchema, queryString, null, params);
  }

  mutate (mutationString, params) {
    return graphql(this.graphQlSchema, mutationString, null, params);
  }
}
