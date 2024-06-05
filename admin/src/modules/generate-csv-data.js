const generateCsvData = (investments, companies) => {
  const companyMap = companies.reduce((map, company) => {
    map[company.id] = company.name;
    return map;
  }, {});

  return investments.flatMap((investment) =>
    investment.holdings.map((holding) => ({
      User: investment.userId,
      "First Name": investment.firstName,
      "Last Name": investment.lastName,
      Date: investment.date,
      Holding: companyMap[holding.id] || "Unknown",
      Value: investment.investmentTotal * holding.investmentPercentage,
    }))
  );
};

module.exports = generateCsvData;
