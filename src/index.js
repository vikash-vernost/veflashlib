const { connectRedis } = require("./redisClient.js");
const { getCache, setCache } = require("./cache.js");
const config = require("./config.js");


const initiate = async ({ apiKey, domain }) => {
  const client = await connectRedis(apiKey, domain);
  if (!client) {
    throw new Error("Failed to connect to Redis");
  }
  return { success: true, message: "Redis connected successfully" };
};

const get = async (apiKey, domain, attributes, filter = null) => {
  return await getCache(apiKey, domain, attributes, filter);
};

const set = async (apiKey, domain, attributes, value) => {

  return await setCache(apiKey, domain, attributes, value);
};

module.exports = {
  initiate,
  get,
  set
};