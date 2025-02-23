// node-graphql/src/index.js

const { ApolloServer } = require('apollo-server');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');
const { createLoaders } = require('./utils/dataLoaders');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    loaders: createLoaders()
  })
});

const port = process.env.PORT || 9090;

// const server = new ApolloServer({ resolvers, typeDefs });

server.listen({ port }, () => console.log(`Server runs at: http://localhost:${port}`));
