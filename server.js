import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the index.html directly from the root directory
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Serve static files (style.css, script.js)
app.use(express.static(__dirname));

// Proxy endpoint to fetch external data
app.get("/proxy", async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send("Please provide a URL.");
    }

    try {
        const response = await fetch(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const text = await response.text();
        res.send(text);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Failed to fetch data.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
