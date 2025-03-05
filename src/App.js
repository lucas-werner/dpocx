import React, { useState, useEffect } from "react";
import "./index.css";
import OpenAI from "openai";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Create an instance of the OpenAI client.
// In production, load your API key from an environment variable.
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Helper function to convert an image URL to a base64 data URL.
const getDataUrlFromImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = () => {
      reject(new Error("Could not load image at " + url));
    };
    img.src = url;
  });
};

function Navbar({ selectedPMA, setSelectedPMA }) {
  const [privacyDeskDropdownOpen, setPrivacyDeskDropdownOpen] = useState(false);
  const [pmaDropdownOpen, setPmaDropdownOpen] = useState(false);

  const togglePrivacyDeskDropdown = () =>
    setPrivacyDeskDropdownOpen(!privacyDeskDropdownOpen);
  const togglePmaDropdown = () => setPmaDropdownOpen(!pmaDropdownOpen);

  const handleSelectPMA = (pma) => {
    setSelectedPMA(pma);
    setPmaDropdownOpen(false);
  };

  const privacyDeskOptions = ["Desk Option 1", "Desk Option 2", "Desk Option 3"];
  const pmaOptions = [
    "PMA 01",
    "PMA 02",
    "PMA 03",
    "PMA 04",
    "PMA 05",
    "PMA 06",
    "PMA 07",
    "PMA 08",
    "PMA 09",
    "PMA 10",
  ];

  const appTitle =
    selectedPMA === "PMA 09"
      ? "Data Breach Severity Calculator"
      : "DPOC Tools";

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img
          src="https://www.dpoconsultancy.com/wp-content/uploads/2024/03/DPO_logo.svg"
          alt="DPO Consultancy Logo"
          className="logo"
        />
        <span className="app-title">{appTitle}</span>
      </div>
      {/* Privacy Desk dropdown appears first */}
      <div className="dropdown">
        <button onClick={togglePrivacyDeskDropdown} className="dropdown-button">
          Privacy Desk ▼
        </button>
        {privacyDeskDropdownOpen && (
          <div className="dropdown-content">
            {privacyDeskOptions.map((option, idx) => (
              <a key={idx} href="#">
                {option}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="dropdown">
        <button onClick={togglePmaDropdown} className="dropdown-button">
          {selectedPMA} ▼
        </button>
        {pmaDropdownOpen && (
          <div className="dropdown-content">
            {pmaOptions.map((option) => (
              <a key={option} onClick={() => handleSelectPMA(option)}>
                {option}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function ChatBox() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [latestAnswer, setLatestAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userMessage = { role: "user", content: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setQuery("");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: updatedMessages,
        temperature: 0.7,
      });
      if (completion.choices && completion.choices.length > 0) {
        const botMessage = completion.choices[0].message;
        setMessages((prev) => [...prev, botMessage]);
        setLatestAnswer(botMessage.content);
      }
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
    }
  };

  return (
    <div className="chatbox">
      <h2>Describe the Data Breach our assistant «DPOCx»</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Please describe the Data Breach"
        ></textarea>
        <button type="submit">Ask DPOCx</button>
      </form>
      <div className="chat-answer">
        <h3>DPOCx Advice:</h3>
        <p>{latestAnswer}</p>
      </div>
    </div>
  );
}

function App() {
  const [selectedPMA, setSelectedPMA] = useState("PMA 09");

  // Data Breach Severity Calculator states
  const [dpcCategory, setDpcCategory] = useState("1");
  const [dpc, setDpc] = useState("1");
  const [ei, setEi] = useState("0.25");
  const [confidentiality, setConfidentiality] = useState("0");
  const [integrity, setIntegrity] = useState("0");
  const [availability, setAvailability] = useState("0");
  const [malicious, setMalicious] = useState("0");
  const [result, setResult] = useState(null);

  const [dpcText, setDpcText] = useState("");
  const [eiText, setEiText] = useState("");
  const [confText, setConfText] = useState("");
  const [integrityText, setIntegrityText] = useState("");
  const [availText, setAvailText] = useState("");
  const [maliciousText, setMaliciousText] = useState("");

  const dpcOptions = {
    1: "1 – Simple data, e.g., basic info like name and contact details.",
    2: "2 – Behavioral data, e.g., preferences, habits, or traffic data.",
    3: "3 – Financial data, e.g., bank statements, transaction details.",
    4: "4 – Sensitive data, e.g., health or political affiliation.",
  };

  // Interactive table data for each criterion:
  const dpcTableData = {
    1: [
      { score: "1", description: "Basic score: no aggravating factors." },
      { score: "2", description: "Increased by 1: allows profiling of social/financial status." },
      { score: "3", description: "Increased by 2: leads to assumptions about sensitive traits." },
      { score: "4", description: "Increased by 3: vulnerable groups or minors." },
    ],
    2: [
      { score: "1", description: "Decreased by 1: minimal behavioral insight." },
      { score: "2", description: "Basic score: no adjustment." },
      { score: "3", description: "Increased by 1: detailed behavioral profile possible." },
      { score: "4", description: "Increased by 2: sensitive behavioral data available." },
    ],
    3: [
      { score: "1", description: "Decreased by 2: minimal financial insight." },
      { score: "2", description: "Decreased by 1: limited financial info." },
      { score: "3", description: "Basic score: no adjustment." },
      { score: "4", description: "Increased by 1: full financial details disclosed." },
    ],
    4: [
      { score: "1", description: "Decreased by 1: data publicly available." },
      { score: "2", description: "Decreased by 2: general assumptions possible." },
      { score: "3", description: "Decreased by 1: minor sensitivity." },
      { score: "4", description: "Basic score: no lessening factors." },
    ],
  };

  const eiTableData = [
    { score: "0.25", description: "Very difficult to identify the individual." },
    { score: "0.5", description: "Identification possible but requires effort." },
    { score: "0.75", description: "Several clues ease identification." },
    { score: "1", description: "Individual can be directly identified." },
  ];

  const confTableData = [
    { score: "0", description: "No breach in confidentiality." },
    { score: "0.25", description: "Data shared with a few known recipients." },
    { score: "0.5", description: "Data shared with several recipients." },
  ];

  const integrityTableData = [
    { score: "0", description: "Data remains unaltered." },
    { score: "0.25", description: "Minor alterations with easy recovery." },
    { score: "0.5", description: "Data altered irrecoverably." },
  ];

  const availTableData = [
    { score: "0", description: "Data recoverable; backups exist." },
    { score: "0.25", description: "Low availability; temporary unavailability." },
    { score: "0.5", description: "High unavailability; data completely lost." },
  ];

  const maliciousTableData = [
    { score: "0", description: "Breach appears accidental." },
    { score: "0.5", description: "Evidence of deliberate action." },
  ];

  // Update final result whenever any score or comment changes.
  useEffect(() => {
    const dpcVal = parseFloat(dpc);
    const eiVal = parseFloat(ei);
    const confVal = parseFloat(confidentiality);
    const integrityVal = parseFloat(integrity);
    const availVal = parseFloat(availability);
    const maliciousVal = parseFloat(malicious);
    const cb = confVal + integrityVal + availVal + maliciousVal;
    const severity = dpcVal * eiVal + cb;
    let level = "";
    if (severity < 3) level = "Low";
    else if (severity < 5) level = "Medium";
    else if (severity < 7) level = "High";
    else level = "Very High";

    setResult({
      severity: severity.toFixed(2),
      level,
      dpcValue: dpc,
      eiValue: ei,
      cbValue: cb.toFixed(2),
      breakdown: {
        "Data Processing Context (DPC)": {
          option: dpc,
          score: dpc,
          description: dpcOptions[dpcCategory],
          comment: dpcText,
        },
        "Ease of Identification (EI)": {
          option: ei,
          score: ei,
          description: eiTableData.find((item) => item.score === ei)?.description || "",
          comment: eiText,
        },
        "Loss of Confidentiality": {
          option: confidentiality,
          score: confidentiality,
          description: confTableData.find((item) => item.score === confidentiality)?.description || "",
          comment: confText,
        },
        "Loss of Integrity": {
          option: integrity,
          score: integrity,
          description: integrityTableData.find((item) => item.score === integrity)?.description || "",
          comment: integrityText,
        },
        "Loss of Availability": {
          option: availability,
          score: availability,
          description: availTableData.find((item) => item.score === availability)?.description || "",
          comment: availText,
        },
        "Malicious Intent": {
          option: malicious,
          score: malicious,
          description: maliciousTableData.find((item) => item.score === malicious)?.description || "",
          comment: maliciousText,
        },
      },
    });
  }, [
    dpc,
    dpcCategory,
    ei,
    confidentiality,
    integrity,
    availability,
    malicious,
    dpcText,
    eiText,
    confText,
    integrityText,
    availText,
    maliciousText,
  ]);

  const getRiskColor = (level) => {
    if (level === "Low") return "#28a745";
    if (level === "Medium") return "#ffc107";
    if (level === "High") return "#dc3545";
    if (level === "Very High") return "#c82333";
    return "black";
  };

  // Final risk summary table rows (without the "Selected Option" column)
  const summaryTableRows = result
    ? Object.entries(result.breakdown).map(([key, value]) => (
        <tr key={key}>
          <td>{key}</td>
          <td>{value.score}</td>
          <td>{value.description}</td>
          <td>{value.comment}</td>
        </tr>
      ))
    : null;

  // Helper to render an interactive table given data and current selected value.
  const renderInteractiveTable = (dataArray, currentValue, setValue) => {
    return (
      <div className="dpc-table">
        <table>
          <thead>
            <tr>
              <th>Score</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {dataArray.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => setValue(row.score)}
                className={currentValue === row.score ? "selected" : ""}
              >
                <td>{row.score}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    // Get the company logo as a data URL (using the provided SVG URL)
    const logoUrl =
      "https://www.dpoconsultancy.com/wp-content/uploads/2024/03/DPO_logo.svg";
    try {
      const logoDataUrl = await getDataUrlFromImage(logoUrl);
      // Add the logo at top-left: x=10, y=10, width=50, height=20
      doc.addImage(logoDataUrl, "PNG", 10, 10, 50, 20);
    } catch (error) {
      console.error("Error loading logo:", error);
    }
    doc.setFontSize(16);
    // Adjust text position below the logo
    doc.text("Risk Summary Report", 14, 40);
    // Add the final risk summary table from the element with id 'final-risk-table'
    doc.autoTable({ html: "#final-risk-table", startY: 50 });
    doc.save("Risk_Summary_Report.pdf");
  };

  return (
    <div className="container">
      <Navbar selectedPMA={selectedPMA} setSelectedPMA={setSelectedPMA} />
      {/* Description and instructions before chatbot */}
      <div className="description-container">
        <p>
          How it works: First, describe the data breach to DPOCx by entering your details above.
          DPOCx will provide advice based on your input. The methodology is derived from ENISA.
          For more details, please access the{" "}
          <a
            href="https://www.enisa.europa.eu/publications/dbn-severity"
            target="_blank"
            rel="noopener noreferrer"
          >
            ENISA report
          </a>.
          Then, fill in the risk assessment details below using the interactive tables.
          Finally, you can download the complete risk summary as a PDF.
        </p>
      </div>
      <div className="chatbox-container">
        <ChatBox />
      </div>
      {selectedPMA === "PMA 09" ? (
        <main className="main-content">
          <div className="form-container">
            <div className="section">
              <h2>Data Processing Context (DPC)</h2>
              <p>DPC represents the type of data involved in the breach.</p>
              <label className="question">Select the data type:</label>
              <div className="radio-group">
                {Object.entries(dpcOptions).map(([key, description]) => (
                  <label key={key}>
                    <input
                      type="radio"
                      name="dpcCategory"
                      value={key}
                      checked={dpcCategory === key}
                      onChange={(e) => {
                        setDpcCategory(e.target.value);
                        setDpc(e.target.value);
                      }}
                    />
                    {description}
                  </label>
                ))}
              </div>
              {renderInteractiveTable(dpcTableData[dpcCategory], dpc, setDpc)}
            </div>
            <div className="section">
              <h2>Ease of Identification (EI)</h2>
              <p>EI measures how easily an individual can be identified from the breached data.</p>
              <label className="question">Explain your EI score:</label>
              <textarea
                value={eiText}
                onChange={(e) => setEiText(e.target.value)}
                placeholder="Enter explanation..."
              ></textarea>
              {renderInteractiveTable(eiTableData, ei, setEi)}
            </div>
            <div className="section">
              <h2>Loss of Confidentiality</h2>
              <p>This evaluates the extent of data disclosure.</p>
              <label className="question">Explain your Confidentiality score:</label>
              <textarea
                value={confText}
                onChange={(e) => setConfText(e.target.value)}
                placeholder="Enter explanation..."
              ></textarea>
              {renderInteractiveTable(confTableData, confidentiality, setConfidentiality)}
            </div>
            <div className="section">
              <h2>Loss of Integrity</h2>
              <p>This measures if and how the data has been altered.</p>
              <label className="question">Explain your Integrity score:</label>
              <textarea
                value={integrityText}
                onChange={(e) => setIntegrityText(e.target.value)}
                placeholder="Enter explanation..."
              ></textarea>
              {renderInteractiveTable(integrityTableData, integrity, setIntegrity)}
            </div>
            <div className="section">
              <h2>Loss of Availability</h2>
              <p>This examines whether data can be accessed when needed.</p>
              <label className="question">Explain your Availability score:</label>
              <textarea
                value={availText}
                onChange={(e) => setAvailText(e.target.value)}
                placeholder="Enter explanation..."
              ></textarea>
              {renderInteractiveTable(availTableData, availability, setAvailability)}
            </div>
            <div className="section">
              <h2>Malicious Intent</h2>
              <p>This evaluates whether the breach was accidental or intentional.</p>
              <label className="question">Explain your Malicious Intent score:</label>
              <textarea
                value={maliciousText}
                onChange={(e) => setMaliciousText(e.target.value)}
                placeholder="Enter explanation..."
              ></textarea>
              {renderInteractiveTable(maliciousTableData, malicious, setMalicious)}
            </div>
          </div>
          <div className="result-container">
            {result && (
              <div className="risk-summary" id="risk-summary">
                <h2>Risk Summary</h2>
                <p className="formula">
                  Formula: SE = (DPC: {result.dpcValue}) x (EI: {result.eiValue}) + (CB: {result.cbValue})
                </p>
                <table id="final-risk-table">
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      <th>Score</th>
                      <th>Description</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>{summaryTableRows}</tbody>
                </table>
                <h3>
                  Final Severity Score: {result.severity} -{" "}
                  <span style={{ color: getRiskColor(result.level) }}>
                    {result.level}
                  </span>
                </h3>
                <button className="generate-report" onClick={generatePDF}>
                  Generate PDF
                </button>
              </div>
            )}
          </div>
        </main>
      ) : (
        <p>Please select PMA 09 to use the Data Breach Severity Calculator.</p>
      )}
    </div>
  );
}

export default App;
