const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const cors = require("cors");

// Allow requests from your GitHub Pages domain
app.use(cors({
  origin: "https://lucas-werner.github.io"
}));

app.use(express.json());




app.post("/api/chat", async (req, res) => {
  try {
    // Example payload – adjust as needed based on your documentation.
    const payload = {
      model: "gpt-4o-mini",
      messages: req.body.messages, // e.g. [{ role: "user", content: "Say this is a test!" }]
      temperature: 0.7
    };
    console.log(payload)

    console.log(process.env.OPENAI_API_KEY)

    // Make the API request to OpenAI. Note that the API documentation
    // specifies that the request must include an Authorization header
    // in the form "Bearer YOUR_API_KEY".
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          // Optionally, if your organization or project requires additional headers:
          // "OpenAI-Organization": "org-yourOrgID",
          // "OpenAI-Project": "yourProjectID"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error from OpenAI API:", error.response ? error.response.data : error);
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
