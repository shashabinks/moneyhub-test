const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const { Parser } = require("json2csv");
const supertest = require("supertest");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

jest.mock("axios");

// func to call endpoints/fetch data
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
      "/investments/export",
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

// endpoint to generate csv report
app.get("/generate-csv-report", async (req, res) => {
  try {
    const [investments, companies] = await Promise.all([
      fetchData("/investments"),
      fetchData("/companies"),
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

    const response = await supertest(app).get("/generate-csv-report");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("text/csv; charset=utf-8");
    expect(response.text).toContain(
      '"User","First Name","Last Name","Date","Holding","Value'
    );
    expect(response.text).toContain(
      '1","Billy","Bob","2020-01-01","The Small Investment Company",1400'
    );
  });
});
