const { Parser } = require("json2csv");
const axios = require("axios");
const config = require("config");
const { fetchCompanies } = require("../modules/fetch-data");

async function generateCsv(investments) {
  try {
    const csvData = [];

    for (const investment of investments) {
      for (const holding of investment.holdings) {
        const companyResponse = await fetchCompanies(holding.id);
        const companyName = companyResponse.name;

        csvData.push({
          User: investment.userId,
          "First Name": investment.firstName,
          "Last Name": investment.lastName,
          Date: investment.date,
          Holding: companyName,
          Value: investment.investmentTotal * holding.investmentPercentage,
        });
      }
    }

    const fields = [
      "User",
      "First Name",
      "Last Name",
      "Date",
      "Holding",
      "Value",
    ];
    const opts = { fields, header: false, delimiter: "|" };
    const json2csvParser = new Parser(opts);
    const csv =
      "User|First Name|Last Name|Date|Holding|Value|\n" +
      json2csvParser.parse(csvData);

    return csv;
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
}

module.exports = generateCsv;
