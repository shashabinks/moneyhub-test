const express = require("express");
const config = require("config");

const { Parser } = require("json2csv");

const sendCsvReport = require("./modules/send-csv-report");
const fetchData = require("./modules/fetch-data");
const generateCsvData = require("./modules/generate-csv-data");

const app = express();

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
