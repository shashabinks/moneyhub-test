const generateCsv = require("../src/modules/generate-csv-data");

const { fetchCompanies } = require("../src/modules/fetch-data");

jest.mock("axios");
jest.mock("../src/modules/fetch-data", () => ({
  fetchInvestments: jest.fn(),
  fetchCompanies: jest.fn(),
}));

const companies = [
  { id: "1", name: "Big Investment Co" },
  { id: "2", name: "Small Investment Co" },
];

const investments = [
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
];

describe("generateCsv", () => {
  beforeAll(() => {
    fetchCompanies.mockImplementation((id) => {
      const company = companies.find((company) => company.id === id);
      if (company) {
        return Promise.resolve(company);
      }
      return Promise.reject(new Error("Company not found"));
    });
  });

  it("should generate CSV for all investments", async () => {
    const csv = await generateCsv(investments);

    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
"1"|"Alice"|"Doe"|"2021-01-01"|"Big Investment Co"|500
"1"|"Alice"|"Doe"|"2021-01-01"|"Small Investment Co"|500
"2"|"Bob"|"Smith"|"2021-01-01"|"Small Investment Co"|2000
`;
    expect(csv.trim()).toBe(expectedCsv.trim());
  });

  it("should generate CSV for a specific user ID", async () => {
    const specificInvestments = investments.filter(
      (investment) => investment.userId === "1"
    );
    const csv = await generateCsv(specificInvestments);
    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
"1"|"Alice"|"Doe"|"2021-01-01"|"Big Investment Co"|500
"1"|"Alice"|"Doe"|"2021-01-01"|"Small Investment Co"|500
`;
    expect(csv.trim()).toBe(expectedCsv.trim());
  });

  it("should return empty CSV for non-existent user ID", async () => {
    const nonExistentInvestments = investments.filter(
      (investment) => investment.userId === "3"
    );
    const csv = await generateCsv(nonExistentInvestments);
    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
`;
    expect(csv.trim()).toBe(expectedCsv.trim());
  });
});
