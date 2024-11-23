import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests (useful for frontend to access the API)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Scrape function to get election data
async function scrapeData(url) {
  try {
    // Launch a headless browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the target URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract candidates and their votes
    const result = await page.evaluate(() => {
      const candidates = [];
      const rows = document.querySelectorAll('table tr'); // Modify the selector based on actual page structure
      rows.forEach(row => {
        const columns = row.querySelectorAll('td');
        if (columns.length > 0) {
          const name = columns[0]?.textContent.trim();
          const votes = columns[1]?.textContent.trim();
          const result = columns[2]?.textContent.trim() || 'Pending';
          candidates.push({ name, votes, result });
        }
      });
      return candidates;
    });

    // Close the browser
    await browser.close();

    return result;
  } catch (error) {
    console.error('Error scraping data:', error);
    return [];
  }
}

// API route to fetch scraped data
app.get('/scrape', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('Please provide a valid URL.');
  }

  try {
    const data = await scrapeData(url);
    res.json(data);  // Send scraped data as JSON response
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
