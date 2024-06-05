const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const request = require("request");
const axios = require("axios");
const { Parser } = require("json2csv");

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));

app.get("/investments/:id", (req, res) => {
  const { id } = req.params;
  request.get(
    `${config.investmentsServiceUrl}/investments/${id}`,
    (e, r, investments) => {
      if (e) {
        console.error(e);
        res.send(500);
      } else {
        res.send(investments);
      }
    }
  );
});

// app.get("/admin/generate-csv-report", (req, res) => {
//   // fetch all investments
//   request.get(
//     `${config.investmentsServiceUrl}/investments`,
//     (err, response, body) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send("Error fetching investments");
//       }

//       const investments = JSON.parse(body);

//       // fetch financial companies
//       request.get(
//         `${config.financialCompaniesServiceUrl}/companies`,
//         (err, response, body) => {
//           if (err) {
//             console.error(err);
//             return res.status(500).send("Error fetching companies");
//           }

//           const companies = JSON.parse(body);

//           // map companies by ID for easy lookup
//           const companyMap = companies.reduce((map, company) => {
//             map[company.id] = company.name;
//             return map;
//           }, {});

//           // prepare CSV data
//           const csvData = [];
//           investments.forEach((investment) => {
//             investment.holdings.forEach((holding) => {
//               const companyName = companyMap[holding.id];
//               csvData.push({
//                 User: investment.userId,
//                 "First Name": investment.firstName,
//                 "Last Name": investment.lastName,
//                 Date: investment.date,
//                 Holding: companyName ? companyName : "Unknown",
//                 Value:
//                   investment.investmentTotal * holding.investmentPercentage,
//               });
//             });
//           });

//           // convert to CSV
//           const json2csvParser = new Parser({
//             fields: [
//               "User",
//               "First Name",
//               "Last Name",
//               "Date",
//               "Holding",
//               "Value",
//             ],
//           });
//           const csv = json2csvParser.parse(csvData);

//           // send CSV to investments/export
//           request.post(
//             `${config.investmentsServiceUrl}/investments/export`,
//             {
//               json: { csv },
//               headers: { "Content-Type": "application/json" },
//             },
//             (err, response, body) => {
//               if (err) {
//                 console.error(err);
//                 return res.status(500).send("Error exporting CSV");
//               }

//               res.header("Content-Type", "text/csv");
//               res.send(csv);
//             }
//           );
//         }
//       );
//     }
//   );
// });

app.get("/admin/generate-csv-report", async (req, res) => {
  try {
    // Fetch all investments
    const investmentsResponse = await axios.get(
      `${config.investmentsServiceUrl}/investments`
    );
    const investments = investmentsResponse.data;

    // Fetch financial companies
    const companiesResponse = await axios.get(
      `${config.financialCompaniesServiceUrl}/companies`
    );
    const companies = companiesResponse.data;

    // Map companies by ID for easy lookup
    const companyMap = companies.reduce((map, company) => {
      map[company.id] = company.name;
      return map;
    }, {});

    // Prepare CSV data
    const csvData = [];
    investments.forEach((investment) => {
      investment.holdings.forEach((holding) => {
        const companyName = companyMap[holding.id];
        csvData.push({
          User: investment.userId,
          "First Name": investment.firstName,
          "Last Name": investment.lastName,
          Date: investment.date,
          Holding: companyName ? companyName : "Unknown",
          Value: investment.investmentTotal * holding.investmentPercentage,
        });
      });
    });

    // Convert to CSV
    const json2csvParser = new Parser({
      fields: ["User", "First Name", "Last Name", "Date", "Holding", "Value"],
    });
    const csv = json2csvParser.parse(csvData);

    // Send CSV to investments/export
    await axios.post(
      `${config.investmentsServiceUrl}/investments/export`,
      { csv },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Return CSV as response
    res.header("Content-Type", "text/csv");
    res.send(csv);
  } catch (error) {
    console.error(error);
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
