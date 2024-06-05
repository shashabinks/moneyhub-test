const axios = require("axios");
const config = require("config");

const sendCsvReport = async (csv) => {
  try {
    await axios.post(
      `${config.investmentsServiceUrl}/investments/export`,
      { csv },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending CSV report:", error);
    throw new Error("Error sending CSV report");
  }
};

module.exports = sendCsvReport;
