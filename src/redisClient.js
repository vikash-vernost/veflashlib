const axios = require("axios");
const { createClient } = require("redis");
let client = null;

const connectRedis = async (apiKey, domain) => {
  try {

    if (!apiKey || !domain) {
      throw new Error("API Key and Domain are required to connect to Redis");
    }

    const apiUrl = `${domain}/api/backend/get-client-data`;
    const headers = {
      "api-key": apiKey
    }

    const response = await axios.post(apiUrl, {}, { headers });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch client details: ${response.statusText}`);
    }

    const redisKey = response?.data?.result?.redis_key;

    client = createClient({
      url: redisKey
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await client.connect();
    return client;

  } catch (error) {
    console.error("Error creating Redis client:", error);
    throw error;
  }
};

const getClient = () => {
  if (!client) {
    throw new Error("Redis not initialized");
  }
  return client;
};

module.exports = {
  connectRedis,
  getClient
};