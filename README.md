# InventIQ — Apni Dukaan, Apna AI

AI-first SaaS for Indian kirana store owners. Manage inventory, get restock alerts, and generate WhatsApp offers — all via chat in Hindi, Gujarati, or English.

---

## Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Server Environment

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/inventiq
JWT_SECRET=your_secret_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Run the App

```bash
# Terminal 1 — start server
cd server
npm run dev

# Terminal 2 — start client
cd client
npm run dev
```

App runs at: http://localhost:5173

---

## Switching from Anthropic to Groq (Free)

1. Install Groq SDK: `npm install groq-sdk` in `/server`
2. Open `server/services/claudeService.js`
3. Replace the top section with:

```js
const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
```

4. Change the API call to:

```js
const response = await client.chat.completions.create({
  model: "llama3-70b-8192",   // or "mixtral-8x7b-32768"
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ],
  max_tokens: 1024,
});
return JSON.parse(response.choices[0].message.content);
```

5. Add `GROQ_API_KEY=your_groq_key` to `server/.env`
6. Get free key at: https://console.groq.com

---

## Project Structure

```
inventiq/
├── server/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, Inventory, Sale, ChatLog
│   ├── controllers/              auth, inventory, chat
│   ├── routes/                   auth, inventory, chat
│   ├── services/claudeService.js AI brain (swap here for Groq)
│   ├── middleware/authMiddleware  JWT protect
│   └── index.js                  Entry point
└── client/
    └── src/
        ├── pages/                Login, Register, Dashboard, Chat,
        │                         Inventory, Offers, Reports, Settings
        ├── components/           Layout, ChatWindow, InventoryTable,
        │                         StatCard, StockAlertCard, SalesChart,
        │                         OfferPreviewCard
        ├── context/AuthContext   Global auth state
        └── api/                  Axios instance + all API calls
```

---

## Features

| Feature | Description |
|---|---|
| AI Chat | Natural language in Hindi/Gujarati/English |
| Inventory | Add, edit, delete items with real-time updates |
| Restock Alerts | AI predicts low stock from patterns |
| WhatsApp Offers | AI generates ready-to-send promo messages |
| Festival Promos | Diwali, Navratri, Holi, Eid templates |
| Sales Reports | Charts with daily revenue and top items |
| Auth | JWT login/register with protected routes |
| Multi-language | Hindi, Gujarati, English responses |

---

## Tech Stack

- **MongoDB** — inventory, sales, users, chat logs
- **Express.js** — REST API
- **React** — chat UI, dashboard, inventory table
- **Node.js** — server runtime
- **Claude API** — AI brain (swappable with Groq)
- **Recharts** — sales charts
- **React Router** — client-side routing
- **JWT** — authentication

---

Built for OceanLab x CHARUSAT Hacks 2026
