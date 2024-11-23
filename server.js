import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Puppeteer Scraper!');
});

// Scrape function and other routes...
async function scrapeData(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(() => {
      const candidates = [];
      const rows = document.querySelectorAll('table tr'); // Modify the selector based on the actual page structure
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

    await browser.close();

    return result;
  } catch (error) {
    console.error('Error scraping data:', error);
    return [];
  }
}

app.get('/scrape', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('Please provide a valid URL.');
  }

  try {
    const data = await scrapeData(url);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
