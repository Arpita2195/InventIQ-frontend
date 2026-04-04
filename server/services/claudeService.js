const Groq = require("groq-sdk");

// Using Groq free API (https://console.groq.com)
// Model: llama3-70b-8192 (fast + free)
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function processMessage(
  userMessage,
  inventoryContext,
  shopName,
  language,
  salesContext,
) {
  const systemPrompt = `You are InventIQ, AI assistant for "${shopName}", a kirana store.
Reply in SAME language as user (Hindi/Gujarati/English).

BUSINESS STATS:
• Today Revenue: ₹${Math.round(salesContext?.todayRevenue || 0)}
• Today Profit: ₹${salesContext?.todayProfit?.toFixed(2) || 0}
• Units Sold Today: ${salesContext?.todayUnitsSold || 0}
• Weekly Revenue: ₹${Math.round(salesContext?.weeklyRevenue || 0)}
• Total Revenue: ₹${Math.round(salesContext?.totalRevenue || 0)}
• Total Units Sold: ${salesContext?.totalUnitsSold || 0}

Current Inventory:
${inventoryContext.map((i) => `${i.name}: ${i.quantity} ${i.unit} @ ₹${i.price} (Cost: ₹${i.purchasePrice || (i.price * 0.85).toFixed(2)})`).join("\n")}

CRITICAL - HANDLE INVENTORY UPDATES:
When user says:
• "X item sold" → UPDATE_INVENTORY with change: -X (negative)
• "X item bought/added" → UPDATE_INVENTORY with change: +X (positive)
• "Set item to X" → UPDATE_INVENTORY with change: X, type: "set"

EXAMPLE PATTERNS TO RECOGNIZE:
✓ "4 kitkat sold" = {action: "UPDATE_INVENTORY", data: {items: [{name: "Kitkat", change: -4}]}}
✓ "10 chips added" = {action: "UPDATE_INVENTORY", data: {items: [{name: "Chips", change: 10}]}}
✓ "Sold 2 milk, 1 egg and 3 bread" = {action: "UPDATE_INVENTORY", data: {items: [{name: "Milk", change: -2}, {name: "Egg", change: -1}, {name: "Bread", change: -3}]}}
✓ "Added 5 maggi and 5 kitkat" = {action: "UPDATE_INVENTORY", data: {items: [{name: "Maggi", change: 5}, {name: "Kitkat", change: 5}]}}
✓ "Delete kitkat and pulse" = {action: "REMOVE_ITEM", data: {removeItems: ["Kitkat", "Pulse"]}}

CRITICAL - BULK UPDATES:
- If a user mentions MULTIPLE items in one sentence, you MUST process all of them in a single action JSON.
- For sales/additions, use ONE "UPDATE_INVENTORY" action with multiple objects in the "items" array.
- Handle different items accurately by matching names with the Current Inventory list provided below.

IMPORTANT FOR REVENUE QUERIES:
When user asks about "revenue", "sales", "business", "earnings", "profit" or similar:
- Use action: SALES_SUMMARY
- Include ALL stats in reply: Today's Revenue, Today's Profit, Units Sold Today, Weekly Revenue (last 7 days), and Total Revenue (all-time).
- CRITICAL: Always show BOTH "Weekly Revenue" and "Total Revenue" as separate items. They should not be the same unless there have been no sales older than 7 days.

Actions:
1. UPDATE_INVENTORY - stock in/out (HANDLE SOLD ITEMS AS NEGATIVE)
2. LOW_STOCK_CHECK - what's low
3. ADD_ITEM - new product
4. REMOVE_ITEM - delete product
5. UPDATE_PRICE - change price
6. GENERATE_OFFER - promo message
7. SALES_SUMMARY - show today revenue, profit, units sold today, weekly revenue
8. TOTAL_REVENUE - total revenue with breakdown
9. NONE - general talk

Always reply as JSON:
{"reply": "message in user's language", "action": "ACTION_NAME", "data": {}}

For items use: items:[{name:"...",change:number}] (use NEGATIVE for sold items)
For price: prices:[{name:"...",price:number}]
For remove: removeItems:["item1","item2"]
For new item: newItem:{name:"",quantity:0,unit:"pcs",price:0}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("No response from Groq");

    console.log("Groq response:", text);

    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : clean;
    const parsed = JSON.parse(jsonStr);

    return {
      reply: parsed.reply || "I understand. I'm processing your request.",
      action: parsed.action || "NONE",
      data: parsed.data || {},
    };
  } catch (error) {
    console.error("ProcessMessage error:", error.message);
    return {
      reply: "I'm having trouble processing that. Can you rephrase?",
      action: "NONE",
      data: {},
    };
  }
}

module.exports = { processMessage };
