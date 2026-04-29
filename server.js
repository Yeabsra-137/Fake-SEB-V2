const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing URL');

  try {
    const response = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
      maxRedirects: 5,
    });
    let html = response.data;
    const urlObj = new URL(targetUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    html = html.replace(/src=["'](?!http|https|\/\/|data:)([^"']+)["']/gi, `src="${baseUrl}/$1"`);
    html = html.replace(/href=["'](?!http|https|\/\/|#|javascript:|mailto:)([^"']+)["']/gi, `href="${baseUrl}/$1"`);
    html = html.replace(/<head>/i, `<head><base href="${baseUrl}/">`);
    res.send(html);
  } catch (error) {
    res.status(500).send(`<html><body><h3>Proxy error</h3><p>Could not fetch ${targetUrl}</p><p>${error.message}</p></body></html>`);
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));