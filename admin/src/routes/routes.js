const express = require("express");

const config = require("config");
const request = require("request");
const axios = require("axios");

const {
  fetchInvestments,
  fetchInvestmentsById,
} = require("../modules/fetch-data");

const generateCsv = require("../modules/generate-csv-data");
const router = express.Router();

// endpoint to generate and send csv
router.get("/investments/generate-csv/:id?", async (req, res) => {
  try {
    const { id } = req.params;

    let investments;

    if (id) {
      investments = await fetchInvestmentsById(id);
    } else {
      investments = await fetchInvestments();
    }

    const csv = await generateCsv(investments);

    await axios.post(
      `${config.investmentsServiceUrl}/investments/export`,
      { csv },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.header("Content-Type", "text/csv");
    res.send(csv);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Error generating report");
  }
});

router.get("/investments/:id", async (req, res) => {
  const { id } = req.params;
  request.get(
    `${config.investmentsServiceUrl}/investments/${id}`,
    (e, r, investments) => {
      if (e) {
        console.error(e);
        res.sendStatus(500);
      } else {
        res.send(investments);
      }
    }
  );
});

module.exports = router;
