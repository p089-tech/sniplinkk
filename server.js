const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'urls.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read URLs from JSON file
function readUrls() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading URLs file:', err);
    return [];
  }
}

// Helper: Write URLs to JSON file
function writeUrls(urls) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(urls, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing URLs file:', err);
  }
}

// Helper: Generate random 6-character slug
function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 1. API: Get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = readUrls();
  res.json(urls);
});

// 2. API: Create a new shortened URL
app.post('/api/shorten', (req, res) => {
  let { originalUrl, customSlug } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required.' });
  }

  // Ensure URL has http/https protocol
  if (!/^https?:\/\//i.test(originalUrl)) {
    originalUrl = 'https://' + originalUrl;
  }

  const urls = readUrls();
  let slug = (customSlug || '').trim().toLowerCase();

  if (slug) {
    // Check if custom slug is already taken
    const exists = urls.find(u => u.slug.toLowerCase() === slug);
    if (exists) {
      return res.status(409).json({ error: 'Custom alias is already taken. Try another!' });
    }
  } else {
    // Generate unique slug
    do {
      slug = generateSlug();
    } while (urls.some(u => u.slug === slug));
  }

  const newEntry = {
    id: Date.now().toString(),
    originalUrl,
    slug,
    clicks: 0,
    createdAt: new Date().toISOString(),
    lastClicked: null
  };

  urls.unshift(newEntry);
  writeUrls(urls);

  res.status(201).json(newEntry);
});

// 3. API: Delete a shortened URL
app.delete('/api/urls/:id', (req, res) => {
  let urls = readUrls();
  const initialLength = urls.length;
  urls = urls.filter(u => u.id !== req.params.id);

  if (urls.length === initialLength) {
    return res.status(404).json({ error: 'Link not found' });
  }

  writeUrls(urls);
  res.json({ message: 'Link deleted successfully' });
});

// 4. Redirect Engine: GET /:slug
app.get('/:slug', (req, res) => {
  const slug = req.params.slug.toLowerCase();

  // Ignore static assets or favicon
  if (slug === 'favicon.ico') return res.status(204).end();

  const urls = readUrls();
  const link = urls.find(u => u.slug.toLowerCase() === slug);

  if (!link) {
    return res.redirect('/?error=not-found');
  }

  // Increment click count & update lastClicked timestamp
  link.clicks = (link.clicks || 0) + 1;
  link.lastClicked = new Date().toISOString();
  writeUrls(urls);

  // 301 Permanent or 302 Found redirect to original destination
  res.redirect(302, link.originalUrl);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SnipLink running on http://0.0.0.0:${PORT}`);
});
