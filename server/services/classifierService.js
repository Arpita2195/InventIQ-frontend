const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function classifyKiranaItem(itemName) {
  const systemPrompt = `You are an expert Indian Kirana store inventory specialist. 
Your task is to classify a product into the following specific Category and Subcategory/Brand structure.

Categories allowed: 
- General
- Fresh Vegetables
- Fresh Fruits
- Milk
- Curd
- Bread
- Rice/Atta/Grains (Packed)
- Pulses/Dal (Packed)
- Sugar
- Tea
- Coffee
- Edible Oil
- Spices
- Masala
- Hair Oil
- Soap
- Toothpaste
- Shampoo
- Detergent
- Biscuits
- Chocolates
- Aerated Drinks
- Snacks
- Fruit Juice
- Mineral Water

Rules:
1. Always return a valid JSON object.
2. 'category' MUST be exactly one of the strings listed above.
3. 'subcategory' should be the Brand name or a descriptive type (e.g. 'Colgate', 'Maggie', 'Basmati'). If no brand is obvious, use 'Other'.
4. 'unit' should be the most common unit for this item in a Kirana store (pcs, kg, L, pkt).
5. If the item is unknown, default to Category: "General", Subcategory: "Other", Unit: "pcs".

Return format:
{
  "category": "string",
  "subcategory": "string",
  "unit": "string"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Classify this product: "${itemName}"` },
      ],
      temperature: 0.1,
    });

    const text = response.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(clean);
  } catch (err) {
    console.error("AI Classification Error:", err);
    return { category: "General", subcategory: "Other", unit: "pcs" };
  }
}

module.exports = { classifyKiranaItem };
