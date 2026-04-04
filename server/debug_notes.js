const mongoose = require("mongoose");
const Notification = require("./models/Notification");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const notes = await Notification.find();
  console.log("Total Notifications:", notes.length);
  console.log(JSON.stringify(notes, null, 2));
  process.exit();
}
check();
