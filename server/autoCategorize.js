require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

const CATEGORY_MAP = {
  "General": ["Other"],
  "Fresh Vegetables": ["Potato", "Onion", "Tomato", "Green Chilli", "Other"],
  "Fresh Fruits": ["Apple", "Banana", "Mango", "Other"],
  "Milk": ["Amul", "Mother Dairy", "Gokul", "Nandini", "Other"],
  "Curd": ["Amul", "Mother Dairy", "Gowardhan", "Other"],
  "Bread": ["Britannia", "Modern", "Harvest Gold", "Other"],
  "Rice/Atta/Grains (Packed)": ["Aashirvaad", "India Gate", "Daawat", "Fortune", "Pillsbury", "Other"],
  "Pulses/Dal (Packed)": ["Tata Sampann", "Rajdhani", "Other"],
  "Sugar": ["Madhur", "Trust", "Parry's", "Other"],
  "Tea": ["Taj Mahal", "Red Label", "Tata Tea", "Wagh Bakri", "Other"],
  "Coffee": ["Nescafe", "Bru", "Davidoff", "Other"],
  "Edible Oil": ["Fortune", "Saffola", "Gemini", "Dhara", "Other"],
  "Spices": ["Everest", "MDH", "Catch", "Suhana", "Other"],
  "Masala": ["Everest", "MDH", "Catch", "Suhana", "Other"],
  "Hair Oil": ["Parachute", "Dabur Amla", "Bajaj Almond drops", "Other"],
  "Soap": ["Dove", "Pears", "Lifebuoy", "Lux", "Santoor", "Other"],
  "Toothpaste": ["Colgate", "Pepsodent", "Close-Up", "Patanjali Dant Kanti", "Sensodyne", "Other"],
  "Shampoo": ["Sunsilk", "Clinic Plus", "Head & Shoulders", "L'Oreal", "Other"],
  "Detergent": ["Surf Excel", "Tide", "Ariel", "Rin", "Wheel", "Other"],
  "Biscuits": ["Parle-G", "Britannia Good Day", "Sunfeast", "Oreo", "Other"],
  "Chocolates": ["Dairy Milk", "KitKat", "Munch", "5 Star", "Other"],
  "Aerated Drinks": ["Coca-Cola", "Pepsi", "Sprite", "Thums Up", "Other"],
  "Snacks": ["Lays", "Kurkure", "Maggie", "Bingo", "Other"],
  "Fruit Juice": ["Real", "Tropicana", "Paper Boat", "Other"],
  "Mineral Water": ["Kinley", "Aquafina", "Bisleri", "Other"]
};

const autoClassify = (name) => {
  const n = name.toLowerCase();
  
  if (n.includes("rice") || n.includes("atta") || n.includes("wheat")) return { category: "Rice/Atta/Grains (Packed)", subcategory: "Other" };
  if (n.includes("dal") || n.includes("chan")) return { category: "Pulses/Dal (Packed)", subcategory: "Other" };
  
  if (n.includes("pizza")) return { category: "Snacks", subcategory: "Other" };
  if (n.includes("maggie") || n.includes("maggi") || n.includes("noodles")) return { category: "Snacks", subcategory: "Maggie" };
  
  if (n.includes("juice") || n.includes("real")) return { category: "Fruit Juice", subcategory: "Other" };
  if (n.includes("chocolate") || n.includes("dairy milk") || n.includes("silk") || n.includes("kitkat")) return { category: "Chocolates", subcategory: "Other" };
  if (n.includes("biscuits") || n.includes("parle") || n.includes("good day")) return { category: "Biscuits", subcategory: "Other" };
  
  if (n.includes("water") || n.includes("bottel") || n.includes("kinley") || n.includes("bisleri")) return { category: "Mineral Water", subcategory: "Other" };
  if (n.includes("coca cola") || n.includes("sprite") || n.includes("cola")) return { category: "Aerated Drinks", subcategory: "Other" };
  
  if (n.includes("colgate")) return { category: "Toothpaste", subcategory: "Colgate" };
  if (n.includes("pepsodent")) return { category: "Toothpaste", subcategory: "Pepsodent" };
  if (n.includes("patanjali") || n.includes("dant kanti")) return { category: "Toothpaste", subcategory: "Patanjali Dant Kanti" };
  if (n.includes("close-up") || n.includes("close up")) return { category: "Toothpaste", subcategory: "Close-Up" };
  
  if (n.includes("surf excel") || n.includes("tide") || n.includes("ariel")) return { category: "Detergent", subcategory: "Other" };
  if (n.includes("soap") || n.includes("dove") || n.includes("lux")) return { category: "Soap", subcategory: "Other" };

  return null;
}

async function run() {
  try {
    await connectDB();
    console.log("Connected to DB...");
    
    const items = await Inventory.find({});
    let updated = 0;
    
    for (let item of items) {
      try {
        const classification = autoClassify(item.name);
        
        if (classification) {
          item.category = classification.category;
          const allowedSubs = CATEGORY_MAP[classification.category] || ["Other"];
          item.subcategory = allowedSubs.includes(classification.subcategory) ? classification.subcategory : "Other";
          
          await item.save();
          updated++;
          console.log(`Auto-classified '${item.name}' --> [${item.category}] > [${item.subcategory}]`);
        } else if (item.category === "General" || item.category === "genral" || !item.category) {
          item.category = "General";
          item.subcategory = "Other";
          await item.save();
          updated++;
          console.log(`Reset '${item.name}' to clean General category`);
        }
      } catch (loopErr) {
        console.error(`Error processing item '${item.name}': ${loopErr.message}`);
      }
    }
    
    console.log(`\nSuccessfully auto-categorized ${updated} items!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
