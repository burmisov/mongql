import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';

export default function createGraphQlSchema (jsonSchema, mongoDbObject) {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: Object.keys(jsonSchema).reduce((tobjs, key) => {
        tobjs[key] = {
          type: new GraphQLObjectType({
            name: jsonSchema[key]._name || key,
            description: jsonSchema[key]._description ||
                `Dataset for "${key}" objects.`,
            fields: () => (Object.keys(jsonSchema[key]).reduce((acc, field) => {
              acc[field] = {
                type: jsTypeToGraphQlType(jsonSchema[key][field]),
                description: field
              };
              return acc;
            }, {}))
          }),
          args: (Object.keys(jsonSchema[key]).reduce((acc, field) => {
            acc[field] = {
              name: field,
              type: jsTypeToGraphQlType(jsonSchema[key][field]),
            };
            return acc;
          }, {})),
          resolve: (root, params, source, fieldASTs) => (
            new Promise((resolve, reject) => {
              const collection = db.collection(key);
              db.collection(key).findOne(
                params,
                { fields: getProjection(fieldASTs) }
              ).toArray((err, item) => {
                if (err) { return reject(err); }
                return resolve(item);
              });
            })
          )
        }
        return tobjs;
      }, {})
    })
  });
}

function jsTypeToGraphQlType (jsType) {
  switch (jsType) {
    case String: return GraphQLString;
    case Boolean: return GraphQLBoolean;
    case Number: return GraphQLFloat;
    default: return GraphQLString;
  }
}

function getProjection (fieldASTs) {
  return fieldASTs.selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = 1;
    return projections;
  }, {});
}
