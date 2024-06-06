const express = require("express");
const bodyParser = require("body-parser");
const request = require("supertest");
const axios = require("axios");
const routes = require("../src/routes/routes");

jest.mock("axios");
jest.mock("../src/modules/fetch-data", () => ({
  fetchInvestments: jest.fn(),
  fetchCompanies: jest.fn(),
}));

const {
  fetchInvestments,
  fetchCompanies,
} = require("../src/modules/fetch-data");

const app = express();
app.use(bodyParser.json());
app.use("/", routes);

describe("GET /investments/generate-csv", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate and send CSV for all investments", async () => {
    fetchInvestments.mockResolvedValue([
      {
        id: "1",
        userId: "1",
        firstName: "Alice",
        lastName: "Doe",
        investmentTotal: 1000,
        date: "2021-01-01",
        holdings: [
          { id: "1", investmentPercentage: 0.5 },
          { id: "2", investmentPercentage: 0.5 },
        ],
      },
      {
        id: "2",
        userId: "2",
        firstName: "Bob",
        lastName: "Smith",
        investmentTotal: 2000,
        date: "2021-01-01",
        holdings: [{ id: "2", investmentPercentage: 1 }],
      },
    ]);

    fetchCompanies.mockResolvedValue([
      { id: "1", name: "Big Investment Co" },
      { id: "2", name: "Small Investment Co" },
    ]);

    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
"1"|"Alice"|"Doe"|"2021-01-01"|"Big Investment Co"|500
"1"|"Alice"|"Doe"|"2021-01-01"|"Small Investment Co"|500
"2"|"Bob"|"Smith"|"2021-01-01"|"Small Investment Co"|2000
`;

    axios.post.mockResolvedValue({});

    const res = await request(app).get("/investments/generate-csv");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toBe("text/csv; charset=utf-8");
    expect(res.text.trim()).toBe(expectedCsv.trim());

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/investments/export"),
      { csv: expectedCsv.trim() },
      { headers: { "Content-Type": "application/json" } }
    );
  });

  it("should generate and send CSV for a specific user ID", async () => {
    fetchInvestments.mockResolvedValue([
      {
        id: "1",
        userId: "1",
        firstName: "Alice",
        lastName: "Doe",
        investmentTotal: 1000,
        date: "2021-01-01",
        holdings: [
          { id: "1", investmentPercentage: 0.5 },
          { id: "2", investmentPercentage: 0.5 },
        ],
      },
      {
        id: "2",
        userId: "2",
        firstName: "Bob",
        lastName: "Smith",
        investmentTotal: 2000,
        date: "2021-01-01",
        holdings: [{ id: "2", investmentPercentage: 1 }],
      },
    ]);

    fetchCompanies.mockResolvedValue([
      { id: "1", name: "Big Investment Co" },
      { id: "2", name: "Small Investment Co" },
    ]);

    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
"1"|"Alice"|"Doe"|"2021-01-01"|"Big Investment Co"|500
"1"|"Alice"|"Doe"|"2021-01-01"|"Small Investment Co"|500
`;

    axios.post.mockResolvedValue({});

    const res = await request(app).get("/investments/generate-csv/1");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toBe("text/csv; charset=utf-8");
    expect(res.text.trim()).toBe(expectedCsv.trim());

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/investments/export"),
      { csv: expectedCsv.trim() },
      { headers: { "Content-Type": "application/json" } }
    );
  });

  it("should return 500 if there is an error generating the report", async () => {
    fetchInvestments.mockRejectedValue(
      new Error("Failed to fetch investments")
    );

    const res = await request(app).get("/investments/generate-csv");

    expect(res.status).toBe(500);
    expect(res.text).toBe("Error generating report");
  });
});
