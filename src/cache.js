const { getClient } = require("./redisClient.js");
const axios = require("axios");

const getCache = async (apiKey, domain, attributes, filter = null) => {
  const client = getClient();

  const apiUrl = `${domain}/api/backend/get-client-data`;
  const headers = {
    "api-key": apiKey
  }

  const response = await axios.post(apiUrl, {}, { headers });
  const formlist = response?.data?.result?.formlist

  if (response.status !== 200 || !formlist) {
    throw new Error(`Failed to fetch client details: ${response.statusText}`);
  }

  const redisKey = generateRedisKey(formlist, attributes);

  if (filter) {
    let path = '$';
    if (filter.destination_id && Array.isArray(filter.destination_id)) {
      const conditions = filter.destination_id.map(id => `@.destination_id==${id}`).join(" || ");
      path = `$.response[?(${conditions})]`;
    }

    const results = await client.json.get(redisKey, { path });
    return results;
  }

  const type = await client.type(redisKey);
  if (type === 'ReJSON-RL') {
    return await client.json.get(redisKey);
  }
  
  const val = await client.get(redisKey);
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
};

const setCache = async (apiKey, domain, attributes, value) => {
  const client = getClient();

  const apiUrl = `${domain}/api/backend/get-client-data`;
  const headers = {
    "api-key": apiKey
  }

  const response = await axios.post(apiUrl, {}, { headers });
  const formlist = response?.data?.result?.formlist

  if (response.status !== 200 || !formlist) {
    throw new Error(`Failed to fetch client details: ${response.statusText}`);
  }

  const redisKey = generateRedisKey(formlist, attributes);

  if (typeof value === "object") {
    return await client.json.set(redisKey, '$', value);
  } else {
    return await client.set(redisKey, value);
  }
};

const generateRedisKey = (formlist, attributes) => {
  if (!Array.isArray(formlist) || !attributes) {
    return "";
  }

  const sortedList = [...formlist].sort((a, b) => a.order - b.order);

  const orderPrefix = sortedList.map(item => item.order).join("");

  const values = sortedList.map(item => attributes[item.parameters] ?? "");

  return `${orderPrefix}:${values.join(":")}`;
};

module.exports = {
  getCache,
  setCache
};