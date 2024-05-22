const { MongoClient } = require("mongodb");
require("dotenv").config();

function client() {
  return new MongoClient(process.env.MONGO_URI);
}

module.exports = {
  client,
};
