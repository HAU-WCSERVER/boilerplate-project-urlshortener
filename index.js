require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Store shortened URLs
const urls = [];
let shortUrl = 1;

// Create a shortened URL
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  let parsedUrl;

  // Check URL format
  try {
    parsedUrl = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: "invalid url" });
  }

  // Only allow HTTP and HTTPS
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return res.json({ error: "invalid url" });
  }

  // Check if the hostname exists
  dns.lookup(parsedUrl.hostname, function (err) {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Check if URL was already shortened
    const existingUrl = urls.find((url) => url.original_url === originalUrl);

    if (existingUrl) {
      return res.json(existingUrl);
    }

    // Create new shortened URL
    const newUrl = {
      original_url: originalUrl,
      short_url: shortUrl,
    };

    urls.push(newUrl);
    shortUrl++;

    res.json(newUrl);
  });
});

// Redirect to original URL
app.get("/api/shorturl/:short_url", function (req, res) {
  const requestedShortUrl = Number(req.params.short_url);

  const foundUrl = urls.find((url) => url.short_url === requestedShortUrl);

  if (!foundUrl) {
    return res.json({ error: "No short URL found" });
  }

  res.redirect(foundUrl.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
