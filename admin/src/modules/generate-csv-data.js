const { Parser } = require("json2csv");

function generateCsv(investments, companies, userId = null) {
  const companyMap = {};
  companies.forEach((company) => {
    companyMap[company.id] = company.name;
  });

  const filteredInvestments = userId
    ? investments.filter((investment) => investment.userId === userId)
    : investments;

  const csvData = filteredInvestments.flatMap((investment) =>
    investment.holdings.map((holding) => ({
      User: investment.userId,
      "First Name": investment.firstName,
      "Last Name": investment.lastName,
      Date: investment.date,
      Holding: companyMap[holding.id],
      Value: investment.investmentTotal * holding.investmentPercentage,
    }))
  );

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
}

module.exports = generateCsv;
