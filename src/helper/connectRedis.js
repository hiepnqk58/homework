const asyncRedis = require("async-redis");
const { REDIS_PORT = 6379, REDIS_HOST } = process.env;
const client = asyncRedis.createClient({
  port: REDIS_PORT,
  host: REDIS_HOST,
});

module.exports = { client };
