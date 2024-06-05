const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const { Parser } = require("json2csv");
const supertest = require("supertest");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

jest.mock("axios");

app.get("/admin/generate-csv-report", async (req, res) => {
  try {
    const investmentsResponse = await axios.get("/investments");
    const investments = investmentsResponse.data;

    const companiesResponse = await axios.get("/companies");
    const companies = companiesResponse.data;

    const companyMap = companies.reduce((map, company) => {
      map[company.id] = company.name;
      return map;
    }, {});

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

    const json2csvParser = new Parser({
      fields: ["User", "First Name", "Last Name", "Date", "Holding", "Value"],
    });
    const csv = json2csvParser.parse(csvData);

    await axios.post(
      "/investments/export",
      { csv },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res.header("Content-Type", "text/csv");
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating CSV report");
  }
});

describe("Admin Service", () => {
  it("should generate CSV report and return it", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: "1",
          userId: "1",
          firstName: "Billy",
          lastName: "Bob",
          investmentTotal: 1400,
          date: "2020-01-01",
          holdings: [{ id: "2", investmentPercentage: 1 }],
        },
      ],
    });
    axios.get.mockResolvedValueOnce({
      data: [
        { id: "1", name: "The Big Investment Company" },
        { id: "2", name: "The Small Investment Company" },
      ],
    });
    axios.post.mockResolvedValueOnce({});

    const response = await supertest(app).get("/admin/generate-csv-report");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("text/csv; charset=utf-8");
    expect(response.text).toContain(
      "User,First Name,Last Name,Date,Holding,Value"
    );
    expect(response.text).toContain(
      "1,Billy,Bob,2020-01-01,The Small Investment Company,1400"
    );
  });
});
