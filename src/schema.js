const { readFileSync } = require("fs");
const { join } = require("path");
const { gql } = require("apollo-server");

const typeDefs = gql(
  readFileSync(join(__dirname, "schema.graphql"), "utf8")
);

module.exports = { typeDefs };