const axios = require("axios");

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw new Error(`Error fetching data from ${url}`);
  }
};

module.exports = fetchData;
