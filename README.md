# 🔗 SnipLink — URL Shortener & Analytics

A lightweight, high-performance URL shortener with real-time click tracking, custom aliases, and instant QR code generation. Built with Node.js and Express. Zero external databases or API keys required!

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 🎯 Features
- **Custom Alias:** Choose your own slug (e.g. `/my-portfolio`) or let the app generate a random 6-character short code.
- **Real-Time Click Analytics:** Automatically tracks total clicks and timestamps for every shortened link.
- **HTTP 302 Redirect Engine:** Instant, seamless redirection to target destination.
- **Instant QR Code:** Generate and download high-resolution QR codes for any shortened link.
- **Zero Database Setup:** Uses a lightweight JSON persistence engine (`data/urls.json`) — works out of the box!
- **One-Click Copy:** Copy shortened URLs to clipboard with instant UI feedback.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Persistence:** JSON File Database (`fs` module)

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
git clone https://github.com/your-username/sniplink.git
cd sniplink
npm install
```

### 2. Start the Application
```bash
npm start
```
Open your browser and visit: **`http://localhost:3000`**

---

## 🌐 Free Cloud Deployment (Render / Railway)
1. Push this repository to your GitHub account.
2. Go to [Render.com](https://render.com) and create a **New Web Service**.
3. Select your `sniplink` repository.
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Create Web Service**. Your URL shortener will be live globally!

---

## 📜 License
Distributed under the MIT License.
