const express = require("express");
const config = require("config");
const axios = require("axios");
const { Parser } = require("json2csv");

const app = express();

// helper to fetch data from a service
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw new Error(`Error fetching data from ${url}`);
  }
};

// func to generate csv data
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

// func to send csv report
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

app.get("/investments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const investments = await fetchData(
      `${config.investmentsServiceUrl}/investments/${id}`
    );
    res.send(investments);
  } catch (error) {
    res.sendStatus(500);
  }
});

// endpoint to generate and send csv
app.get("/investments/generate-csv-report/:id?", async (req, res) => {
  try {
    const { id } = req.params;
    const [investments, companies] = await Promise.all([
      fetchData(
        `${config.investmentsServiceUrl}/investments${id ? `/${id}` : ""}`
      ),
      fetchData(`${config.financialCompaniesServiceUrl}/companies`),
    ]);

    const csvData = generateCsvData(investments, companies);
    const json2csvParser = new Parser({
      fields: ["User", "First Name", "Last Name", "Date", "Holding", "Value"],
      quote: "",
    });
    const csv = json2csvParser.parse(csvData);

    await sendCsvReport(csv);

    res.header("Content-Type", "text/csv");
    res.send(csv);
  } catch (error) {
    res.status(500).send("Error generating CSV report");
  }
});

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err);
    process.exit(1);
  }
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
