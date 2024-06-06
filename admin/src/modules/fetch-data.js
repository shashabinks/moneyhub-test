const axios = require("axios");
const config = require("config");

async function fetchInvestments() {
  const response = await axios.get(
    `${config.investmentsServiceUrl}/investments`
  );
  return response.data;
}

async function fetchCompanies() {
  const response = await axios.get(
    `${config.financialCompaniesServiceUrl}/companies`
  );
  return response.data;
}

module.exports = {
  fetchInvestments,
  fetchCompanies,
};
