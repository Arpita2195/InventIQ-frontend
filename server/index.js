require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  "https://frontend-deploy-gid6ak5ec-yashvi-s-projects-a76b2222.vercel.app",
  "https://frontend-deploy-5kry9s1ue-yashvi-s-projects-a76b2222.vercel.app",
  "https://frontend-deploy-mvdraas5s-yashvi-s-projects-a76b2222.vercel.app",
  "https://invent-iq-frontend-git-main-arpita2195s-projects.vercel.app"
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/bills", require("./routes/bill.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/suppliers", require("./routes/supplier.routes"));
app.use("/api/customers", require("./routes/customer.routes"));

app.get("/api/health", (req, res) => res.json({ status: "InventIQ server running" }));

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`InventIQ server running on port ${PORT}`));
