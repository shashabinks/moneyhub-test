const axios = require("axios");
const config = require("config");

async function fetchInvestments() {
  const response = await axios.get(
    `${config.investmentsServiceUrl}/investments`
  );
  return response.data;
}

async function fetchInvestmentsById(id) {
  const response = await axios.get(
    `${config.investmentsServiceUrl}/investments/${id}`
  );
  return response.data;
}

async function fetchCompanies(id) {
  const response = await axios.get(
    `${config.financialCompaniesServiceUrl}/companies/${id}`
  );

  return response.data;
}

module.exports = {
  fetchInvestments,
  fetchInvestmentsById,
  fetchCompanies,
};
