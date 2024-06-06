const generateCsvData = require("../src/modules/generate-csv-data");

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
  it("should generate CSV for all investments", () => {
    const csv = generateCsvData(investments, companies);
    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
"1"|"Alice"|"Doe"|"2021-01-01"|"Big Investment Co"|500
"1"|"Alice"|"Doe"|"2021-01-01"|"Small Investment Co"|500
"2"|"Bob"|"Smith"|"2021-01-01"|"Small Investment Co"|2000
`;
    expect(csv.trim()).toBe(expectedCsv.trim());
  });

  it("should generate CSV for a specific user ID", () => {
    const csv = generateCsvData(investments, companies, "1");
    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
"1"|"Alice"|"Doe"|"2021-01-01"|"Big Investment Co"|500
"1"|"Alice"|"Doe"|"2021-01-01"|"Small Investment Co"|500
`;
    expect(csv.trim()).toBe(expectedCsv.trim());
  });

  it("should return empty CSV for non-existent user ID", () => {
    const csv = generateCsvData(investments, companies, "3");
    const expectedCsv = `User|First Name|Last Name|Date|Holding|Value|
`;
    expect(csv.trim()).toBe(expectedCsv.trim());
  });
});
