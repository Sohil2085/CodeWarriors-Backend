import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { code, language, input } = req.body;

  try {
    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        stdin: input || "",
        language: language,
        versionIndex: "0" // You can adjust this based on JDoodle documentation for specific languages
      }
    );

    res.json({
      output: response.data.output,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime
    });
  } catch (error) {
    console.error("Error executing code via JDoodle:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Execution failed",
      details: error?.response?.data || error.message
    });
  }
});

export default router;
