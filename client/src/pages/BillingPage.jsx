import { useState, useEffect, useRef, useMemo } from "react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { billApi } from "../api";
import { 
  ShimmerButton, 
  GradientCard, 
  Input, 
  Select, 
  Badge, 
  StatCard,
  GlassCard,
  cn
} from "../components/ui";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Share2, 
  Receipt, 
  Search, 
  ShoppingCart, 
  User, 
  CreditCard,
  History,
  TrendingUp,
  Banknote,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  ChevronRight,
  MoreVertical,
  QrCode,
  FileText
} from "lucide-react";

const GST_RATES = {
  // 0% GST (Completely exempt even if packed, e.g. normal milk pouches, salt, bread, eggs, fresh produce)
  "fresh vegetables": 0,
  "fresh fruits": 0,
  milk: 0,
  salt: 0,
  bread: 0,
  eggs: 0,

  // 5% GST (Pre-packed/labelled grains, pulses, curd, paneer, tea/coffee, spices, edible oil)
  sugar: 5,
  tea: 5,
  coffee: 5,
  "edible oil": 5,
  spices: 5,
  masala: 5,
  grains: 5,
  pulses: 5,
  rice: 5,
  wheat: 5,
  atta: 5,
  curd: 5,
  lassi: 5,
  "packed grains": 5,
  "packed pulses": 5,
  paneer: 5,
  sweets: 5,
  agarbatti: 5,

  // 12% GST (Processed food, dairy products)
  butter: 12,
  ghee: 12,
  cheese: 12,
  "dry fruits": 12,
  "fruit juice": 12,
  namkeen: 12,
  snacks: 12,
  ketchup: 12,
  sauces: 12,

  // 18% GST (FMCG, personal care, cleaning, chocolates, biscuits)
  biscuits: 18,
  chocolates: 18,
  "ice cream": 18,
  "hair oil": 18,
  soap: 18,
  toothpaste: 18,
  shampoo: 18,
  detergent: 18,
  cleaning: 18,
  "personal care": 18,
  "mineral water": 18,
  general: 18,

  // 28% GST (Aerated drinks, luxury)
  "aerated drinks": 28,
  "cold drinks": 28,
  cola: 28,
  "energy drinks": 28,
};

const getGST = (cat, name = "") => {
  let keyToSearch = cat?.toLowerCase() || "general";
  if (keyToSearch === "general" || keyToSearch === "genral") {
    keyToSearch = name.toLowerCase(); // Smart fallback since many items default to "General"
  }

  for (const [k, v] of Object.entries(GST_RATES)) {
    if (keyToSearch.includes(k)) return v;
  }
  return 18; // Default to FMCG rate
};

// Greeting messages
const greetings = [
  "🙏 Dhanyavaad! Aapka order complete ho gaya hai. Phir milenge! 😊",
  "🎉 Thank you for shopping with us! Your satisfaction is our priority! 💜",
  "🙏 Shukriya! Aapka bill ready hai. Hamesha aapki seva mein! 🌟",
  "💐 Thank you dear customer! Wishing you a wonderful day ahead! ✨",
  "🙏 Bahut bahut dhanyavaad! Aapka vishwas hi hamari taakat hai! 💪",
];
const getGreeting = () =>
  greetings[Math.floor(Math.random() * greetings.length)];

// Get festive greeting based on date
const getFestiveGreeting = () => {
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  // March-April: Holi/Navratri season
  if (month === 3 || month === 4)
    return "🌸 Happy Festival Season! May joy and colors fill your life! 🎨";
  // October-November: Diwali season
  if (month === 10 || month === 11)
    return "🪔 Happy Diwali! May prosperity shine upon you! ✨";
  // August: Raksha Bandhan / Independence Day
  if (month === 8) return "🇮🇳 Jai Hind! Wishing you a great day! 🎗️";
  // December-January: New Year
  if (month === 12 || month === 1)
    return "🎊 Happy New Year! Wishing you all the best! 🥳";
  return null;
};

// ─── Styles ────────────────────────────────────────────
// Styles removed - transitioning to Tailwind CSS for "Perfect UI"

// ─── Receipt HTML for printing ─────────────────────────
function generateReceiptHTML(bill, shopName, greeting, festiveGreeting) {
  const items = bill.items || [];
  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px dashed #ddd;font-size:13px;">${item.name}</td>
      <td style="padding:6px 8px;border-bottom:1px dashed #ddd;text-align:center;font-size:13px;">${item.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px dashed #ddd;text-align:right;font-size:13px;">₹${item.price}</td>
      <td style="padding:6px 8px;border-bottom:1px dashed #ddd;text-align:center;font-size:12px;">${item.gstRate || 0}%</td>
      <td style="padding:6px 8px;border-bottom:1px dashed #ddd;text-align:right;font-size:13px;font-weight:600;">₹${((item.total || 0) + (item.gstAmount || 0)).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bill Receipt - ${bill.billNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #f8f9fc; display: flex; justify-content: center; padding: 20px; }
    .receipt { width: 380px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%); color: white; padding: 24px 20px; text-align: center; }
    .header h1 { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { font-size: 12px; opacity: 0.85; margin-top: 4px; }
    .bill-info { padding: 16px 20px; background: #f8f9fc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .bill-number { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #6D28D9; }
    .bill-date { font-size: 12px; color: #64748b; }
    .customer { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; }
    .customer-name { font-weight: 600; font-size: 15px; }
    .customer-phone { font-size: 12px; color: #64748b; margin-top: 2px; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th { padding: 10px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 2px solid #e2e8f0; }
    .totals { padding: 16px 20px; border-top: 2px solid #6D28D9; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .grand-total { display: flex; justify-content: space-between; padding: 12px 0 4px; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #6D28D9; border-top: 2px dashed #e2e8f0; margin-top: 8px; }
    .payment-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .paid { background: #d1fae5; color: #059669; }
    .credit { background: #ffe4e6; color: #e11d48; }
    .greeting { padding: 20px; text-align: center; background: linear-gradient(135deg, #EDE9FE 0%, #f0f9ff 100%); border-top: 1px solid #e2e8f0; }
    .greeting p { font-size: 14px; color: #334155; line-height: 1.6; }
    .greeting .festive { font-size: 13px; color: #6D28D9; margin-top: 8px; font-weight: 500; }
    .footer { padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 11px; color: #94a3b8; }
    .footer .powered { font-size: 10px; color: #cbd5e1; margin-top: 8px; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; width: 100%; max-width: 380px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>InventIQ</h1>
      <p>${shopName || "Apni Dukaan, Apna AI"}</p>
    </div>
    <div class="bill-info">
      <div class="bill-number">${bill.billNumber}</div>
      <div class="bill-date">${new Date(bill.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
    </div>
    <div class="customer">
      <div class="customer-name">👤 ${bill.customer}</div>
      ${bill.phoneNumber ? `<div class="customer-phone">📞 ${bill.phoneNumber}</div>` : ""}
    </div>
    <div style="padding: 0 12px;">
      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align:left;">Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:center;">GST</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>₹${bill.subtotal?.toFixed(2)}</span></div>
      <div class="total-row"><span>GST</span><span style="color:#0D9488;">+ ₹${bill.totalGST?.toFixed(2)}</span></div>
      <div class="total-row">
        <span>Payment</span>
        <span class="payment-badge ${bill.creditType === "credit" ? "credit" : "paid"}">
          ${bill.paymentMethod?.toUpperCase()} ${bill.creditType === "credit" ? "(Udhar)" : "(Paid)"}
        </span>
      </div>
      <div class="grand-total"><span>Grand Total</span><span>₹${bill.totalAmount?.toFixed(2)}</span></div>
    </div>
    <div class="greeting">
      <p>${greeting}</p>
      ${festiveGreeting ? `<p class="festive">${festiveGreeting}</p>` : ""}
    </div>
    <div class="footer">
      <p>Thank you for your patronage! 🙏</p>
      <p class="powered">Powered by InventIQ — Apni Dukaan, Apna AI</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── WhatsApp message builder ──────────────────────────
function buildWhatsAppMessage(bill, shopName, greeting, festiveGreeting) {
  const items = (bill.items || [])
    .map(
      (item, i) =>
        `${i + 1}. ${item.name} × ${item.quantity} = ₹${((item.total || 0) + (item.gstAmount || 0)).toFixed(0)}`,
    )
    .join("\n");

  let msg = `🧾 *BILL RECEIPT*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏪 *${shopName || "InventIQ Store"}*\n`;
  msg += `📋 Bill: *${bill.billNumber}*\n`;
  msg += `📅 ${new Date(bill.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *${bill.customer}*\n\n`;
  msg += `📦 *Items:*\n${items}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 Subtotal: ₹${bill.subtotal?.toFixed(2)}\n`;
  msg += `📊 GST: + ₹${bill.totalGST?.toFixed(2)}\n`;
  msg += `✅ *Grand Total: ₹${bill.totalAmount?.toFixed(2)}*\n`;
  msg += `💳 Payment: ${bill.paymentMethod?.toUpperCase()} (${bill.creditType === "credit" ? "Udhar" : "Paid"})\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `${greeting}\n`;
  if (festiveGreeting) msg += `\n${festiveGreeting}\n`;
  msg += `\n_Powered by InventIQ_ 💜`;

  return msg;
}

export default function BillingPage() {
  const { items: inventoryItems, refreshInventory } = useInventory();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [creditType, setCreditType] = useState("paid");
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState("new");
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const [upiQR, setUpiQR] = useState(null);
  const searchRef = useRef(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (tab === "history") {
      billApi
        .getAll()
        .then(({ data }) => setBills(data))
        .catch(() => {});
      billApi
        .getStats()
        .then(({ data }) => setStats(data))
        .catch(() => {});
    }
  }, [tab]);

  const filtered = inventoryItems.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.inventoryId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.inventoryId === item._id
            ? { ...c, quantity: Math.min(c.quantity + 1, item.quantity) }
            : c,
        );
      }
      return [
        ...prev,
        {
          inventoryId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          gstRate: getGST(item.category, item.name),
          maxQty: item.quantity,
          category: item.category,
        },
      ];
    });
    setSearch("");
    searchRef.current?.focus();
  };

  const updateQty = (inventoryId, delta) => {
    setCart((prev) =>
      prev.map((c) =>
        c.inventoryId === inventoryId
          ? {
              ...c,
              quantity: Math.max(1, Math.min(c.quantity + delta, c.maxQty)),
            }
          : c,
      ),
    );
  };

  const removeFromCart = (inventoryId) => {
    setCart((prev) => prev.filter((c) => c.inventoryId !== inventoryId));
  };

  const subtotal = cart.reduce((a, c) => a + c.price * c.quantity, 0);
  const totalGST = cart.reduce(
    (a, c) => a + (c.price * c.quantity * c.gstRate) / 100,
    0,
  );
  const totalAmount = subtotal + totalGST;

  // ─── Print receipt ───────────────────────────────────
  const printReceipt = (bill) => {
    const greeting = getGreeting();
    const festiveGreeting = getFestiveGreeting();
    const html = generateReceiptHTML(
      bill,
      user?.shopName,
      greeting,
      festiveGreeting,
    );
    const printWindow = window.open("", "_blank", "width=440,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ─── Share on WhatsApp ───────────────────────────────
  const shareOnWhatsApp = (bill) => {
    const greeting = getGreeting();
    const festiveGreeting = getFestiveGreeting();
    const msg = buildWhatsAppMessage(
      bill,
      user?.shopName,
      greeting,
      festiveGreeting,
    );
    const phoneNum = bill.phoneNumber
      ? bill.phoneNumber.replace(/\D/g, "")
      : "";
    const countryPhone = phoneNum.startsWith("91") ? phoneNum : `91${phoneNum}`;
    const url = phoneNum
      ? `https://wa.me/${countryPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // ─── Create bill ─────────────────────────────────────
  const handleCreateBill = async () => {
    if (!customer.trim() || cart.length === 0) return;
    setLoading(true);
    try {
      const { data } = await billApi.create({
        customer: customer.trim(),
        phoneNumber: phone.trim(),
        items: cart.map((c) => ({
          inventoryId: c.inventoryId,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          gstRate: c.gstRate,
        })),
        paymentMethod,
        creditType,
        notes: notes.trim(),
      });
      setSuccess(data);
      setShowReceipt(data);
      setCart([]);
      setCustomer("");
      setPhone("");
      setNotes("");
      setPaymentMethod("cash");
      setCreditType("paid");
      refreshInventory();
    } catch (err) {
      console.error("Bill creation error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to create bill. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Current greeting for success screen
  const currentGreeting = getGreeting();
  const currentFestive = getFestiveGreeting();

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-syne text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Receipt className="text-indigo-600 w-8 h-8" />
            Billing & POS
          </h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            Generate smart bills, manage stock and track customer ledger
          </p>
        </div>
        
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner">
          <button 
            onClick={() => setTab("new")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center gap-2",
              tab === "new" ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Plus size={16} />
            New Terminal
          </button>
          <button 
            onClick={() => setTab("history")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center gap-2",
              tab === "history" ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <History size={16} />
            Transaction History
          </button>
        </div>
      </div>

      {tab === "new" ? (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
          {/* LEFT: Item Search + Cart */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Search Section */}
            <GlassCard className="p-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Search size={20} />
                </div>
                <Input
                  ref={searchRef}
                  placeholder="Search products by name, brand or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 py-3.5 bg-slate-50 border-slate-200 focus:bg-white text-base rounded-2xl transition-all"
                />
              </div>

              {search && (
                <div className="mt-4 border border-slate-100 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 bg-white animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {filtered.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Search size={24} />
                      </div>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Matches Found</p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-auto custom-scrollbar">
                      {filtered.slice(0, 10).map((item) => {
                        const isLow = item.quantity <= item.lowStockThreshold;
                        const inCart = cart.some((c) => c.inventoryId === item._id);
                        return (
                          <div
                            key={item._id}
                            onClick={() => addToCart(item)}
                            className={cn(
                              "flex items-center gap-4 px-5 py-4 cursor-pointer transition-all border-b border-slate-50 last:border-0",
                              inCart ? "bg-indigo-50/50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-300",
                              inCart ? "bg-indigo-600 text-white scale-90" : "bg-slate-100 text-slate-500 group-hover:scale-110"
                            )}>
                              {inCart ? <CheckCircle2 size={24} /> : "📦"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[15px] font-black text-slate-800 truncate">{item.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.category}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-tighter",
                                  isLow ? "text-rose-500" : "text-emerald-500"
                                )}>
                                  Stock: {item.quantity} {item.unit}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-black text-slate-900 leading-none">₹{item.price}</div>
                              {inCart && <div className="text-[10px] font-black text-indigo-500 uppercase mt-1">In Cart</div>}
                            </div>
                            <ChevronRight size={18} className="text-slate-300 ml-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Cart Section */}
            <div className="flex-1 flex flex-col min-h-[400px]">
              <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <ShoppingCart size={16} />
                    </div>
                    <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Checkout Cart</h2>
                    <Badge variant="primary" className="ml-2">{cart.length} Items</Badge>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[11px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-40 grayscale">
                      <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                        <ShoppingCart size={40} className="text-slate-300" />
                      </div>
                      <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm">Cart is currently empty</h3>
                      <p className="text-xs text-slate-400 mt-2 font-medium">Add products to begin generating bill</p>
                    </div>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          {["Product Details", "Rate", "Tax", "Quantity", "Total", ""].map((h) => (
                            <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((c) => {
                          const lineTotal = c.price * c.quantity;
                          const lineGST = (lineTotal * c.gstRate) / 100;
                          return (
                            <tr key={c.inventoryId} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                              <td className="px-6 py-5">
                                <div className="font-black text-slate-800 text-sm leading-tight">{c.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{c.category}</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="font-bold text-slate-700 text-sm whitespace-nowrap">₹{c.price.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-5">
                                <Badge variant="outline" className="text-[11px] font-black border-indigo-100 bg-indigo-50 text-indigo-600">
                                  {c.gstRate}%
                                </Badge>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit border border-slate-200">
                                  <button
                                    className="p-1.5 hover:bg-white rounded-md text-slate-500 hover:text-indigo-600 transition-all font-bold"
                                    onClick={() => updateQty(c.inventoryId, -1)}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <input
                                    className="w-10 bg-transparent text-center font-black text-sm text-slate-800 outline-none"
                                    value={c.quantity}
                                    readOnly
                                  />
                                  <button
                                    className="p-1.5 hover:bg-white rounded-md text-slate-500 hover:text-indigo-600 transition-all font-bold"
                                    onClick={() => updateQty(c.inventoryId, 1)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="font-black text-slate-900 text-[15px]">₹{(lineTotal + lineGST).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button
                                  onClick={() => removeFromCart(c.inventoryId)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Remove from cart"
                                >
                                  <X size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* RIGHT: Customer + Summary */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
            {/* Customer Details */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <User size={18} />
                </div>
                <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Customer Insight</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Name</label>
                  <Input
                    placeholder="Search or enter customer name"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="bg-slate-50 border-slate-100 rounded-xl font-bold py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Reference</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Smartphone size={16} />
                    </div>
                    <Input
                      placeholder="WhatsApp Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-50 border-slate-100 rounded-xl font-bold py-2.5 pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment</label>
                    <Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="bg-slate-50 border-slate-100 rounded-xl font-bold h-11"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI / QR</option>
                      <option value="card">💳 Card</option>
                      <option value="credit">🔖 Store Credit</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                    <Select
                      value={creditType}
                      onChange={(e) => setCreditType(e.target.value)}
                      className="bg-slate-50 border-slate-100 rounded-xl font-bold h-11"
                    >
                      <option value="paid">✅ Settled</option>
                      <option value="credit">🔴 Unpaid (Udhar)</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Internal Notes</label>
                  <Input
                    placeholder="Any special requests or details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-slate-50 border-slate-100 rounded-xl font-medium py-2.5"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Bill Summary */}
            <GlassCard className="p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Financial Audit</h2>
              </div>

              <div className="space-y-3 relative">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[13px] font-bold text-slate-400">Total Items</span>
                  <span className="font-black text-slate-700">{cart.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[13px] font-bold text-slate-400 tracking-tight">Basket Value (Net)</span>
                  <span className="font-black text-slate-700 uppercase">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-slate-400">Tax Levy</span>
                    <Percent size={12} className="text-slate-300" />
                  </div>
                  <span className="font-black text-emerald-600">+ ₹{totalGST.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                {creditType === "credit" && (
                  <div className="flex justify-between items-center py-3 px-3 bg-rose-50 border border-rose-100 rounded-xl animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-500" />
                      <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Mark as Udhar</span>
                    </div>
                    <CheckCircle2 size={16} className="text-rose-500" />
                  </div>
                )}

                <div className="border-t-2 border-dashed border-slate-100 mt-4 pt-5 pb-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Final Payable</span>
                      <span className="font-syne text-sm font-black text-slate-400 uppercase leading-none">Grand Total</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[32px] font-black text-indigo-600 leading-none tracking-tighter">
                        ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[11px] font-bold text-slate-300 mt-1">INC. ALL TAXES</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <ShimmerButton
              onClick={handleCreateBill}
              disabled={loading || !customer.trim() || cart.length === 0}
              className="w-full py-5 rounded-2xl shadow-2xl shadow-indigo-500/20"
            >
              <div className="flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[15px]">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Finalize & Print
                  </>
                )}
              </div>
            </ShimmerButton>
          </div>
        </div>
      ) : (
        /* ──────── HISTORY TAB ──────── */
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Bills", value: stats.totalBills, bg: "bg-indigo-50", text: "text-indigo-600" },
                { label: "Today's Bills", value: stats.todayBills, bg: "bg-teal-50", text: "text-teal-600" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-emerald-50", text: "text-emerald-600" },
                { label: "Today's Revenue", value: `₹${stats.todayRevenue?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-amber-50", text: "text-amber-600" },
                { label: "GST Collected", value: `₹${stats.totalGST?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-cyan-50", text: "text-cyan-600" },
                { label: "Credit (Udhar)", value: `₹${stats.creditAmount?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-rose-50", text: "text-rose-600" },
              ].map((st) => (
                <div key={st.label} className={`${st.bg} border border-white p-4 rounded-2xl shadow-sm transition-transform hover:scale-105`}>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{st.label}</div>
                  <div className={`font-syne text-xl font-black ${st.text}`}>{st.value}</div>
                </div>
              ))}
            </div>
          )}

          <GlassCard className="p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <History size={16} />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Transaction Ledger</h2>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{bills.length} recorded bills</p>
                </div>
              </div>
            </div>

            {bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-40 grayscale">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                  <Receipt size={40} className="text-slate-300" />
                </div>
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm">No Transaction History</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">Recorded bills will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar bg-white">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
                    <tr>
                      {["Invoice No.", "Customer", "Items", "Amount", "Method", "Status", "Timestamp", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <code className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md tracking-wider">
                            {bill.billNumber}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">
                          {bill.customer}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 text-slate-500 border-slate-200">
                            {bill.items?.length || 0} Units
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900 text-sm">
                          ₹{bill.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
                            {bill.paymentMethod === "cash" ? <Banknote size={14} className="text-emerald-500"/> 
                              : bill.paymentMethod === "upi" ? <Smartphone size={14} className="text-indigo-500"/>
                              : bill.paymentMethod === "card" ? <CreditCard size={14} className="text-amber-500"/>
                              : <User size={14} className="text-slate-400"/>}
                            {bill.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={bill.creditType === "credit" ? "danger" : "success"}
                            className="text-[10px] uppercase font-black"
                          >
                            {bill.creditType === "credit" ? "Unpaid (Udhar)" : "Settled"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 whitespace-nowrap">
                          {formatDate(bill.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setViewBill(bill)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => printReceipt(bill)}
                              className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors"
                              title="Print Thermal Receipt"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => shareOnWhatsApp(bill)}
                              className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors"
                              title="Share via WhatsApp"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ──────── VIEW BILL MODAL ──────── */}
      {viewBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewBill(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Receipt size={20} />
                </div>
                <div>
                  <h2 className="font-syne text-xl font-black text-slate-800">Invoice {viewBill.billNumber}</h2>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{formatDate(viewBill.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printReceipt(viewBill)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => shareOnWhatsApp(viewBill)}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={() => setViewBill(null)}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors flex items-center justify-center ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50/30 grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-slate-100">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Customer Name</div>
                <div className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{viewBill.customer}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact No.</div>
                <div className="font-bold text-slate-800 text-sm">{viewBill.phoneNumber || "N/A"}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Mode</div>
                <div className="font-bold text-slate-800 text-sm uppercase">{viewBill.paymentMethod}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Clearance</div>
                <Badge variant={viewBill.creditType === "credit" ? "danger" : "success"} className="text-[10px]">
                  {viewBill.creditType === "credit" ? "Pending" : "Settled"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Item Particulars", "Qty", "Rate", "Tax", "Amount"].map((h) => (
                      <th key={h} className="pb-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {viewBill.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 font-bold text-slate-700 text-sm">{item.name}</td>
                      <td className="py-3 font-black text-slate-500 text-sm">{item.quantity}</td>
                      <td className="py-3 font-bold text-slate-500 text-sm">₹{item.price}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-500">{item.gstRate}%</Badge>
                      </td>
                      <td className="py-3 font-black text-slate-800 text-sm">
                        ₹{((item.total || 0) + (item.gstAmount || 0)).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewBill.notes && (
                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100/50 flex align-center gap-3">
                   <AlertCircle size={16} className="text-amber-500" />
                   <p className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">{viewBill.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-800 text-white rounded-b-3xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subtotal Value</span>
                <span className="font-medium">₹{viewBill.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Taxation (GST)</span>
                <span className="font-medium text-emerald-400">+ ₹{viewBill.totalGST?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <span className="text-[13px] font-black uppercase tracking-widest">Net Final Tag</span>
                <span className="font-syne text-2xl font-black text-indigo-400">
                  ₹{viewBill.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────── SUCCESS + RECEIPT MODAL ──────── */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowReceipt(null)}>
          <div 
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Success Area */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
               <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl shadow-emerald-900/20 animate-bounce-slow">
                  <CheckCircle2 size={40} className="text-emerald-500" />
               </div>
               <h2 className="font-syne text-2xl font-black tracking-tight relative z-10">Transaction Tucked!</h2>
               <p className="text-emerald-100 font-medium text-sm mt-1 relative z-10">Invoice {showReceipt.billNumber} • ₹{showReceipt.totalAmount?.toFixed(2)}</p>
               <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest relative z-10 backdrop-blur-md border border-white/30">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Inventory Deducted
               </div>
            </div>

            {/* Smart Greeting Message */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
               <p className="text-[13px] font-bold text-slate-600 italic">"{currentGreeting}"</p>
               {currentFestive && <p className="text-[12px] font-black text-indigo-600 uppercase tracking-widest mt-2">✨ {currentFestive}</p>}
            </div>
            
            {/* Action Buttons Hub */}
            <div className="p-6 space-y-3 bg-white">
              <button
                onClick={() => shareOnWhatsApp(showReceipt)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#25D366] text-white font-black text-[13px] uppercase tracking-widest hover:bg-[#1DA851] transition-all shadow-lg shadow-[#25D366]/20"
              >
                <Smartphone size={18} /> Push WhatsApp Receipt
              </button>

              <button
                onClick={() => {
                  const upiUrl = `upi://pay?pa=9099314955@ybl&pn=${encodeURIComponent(user?.shopName || "InventIQ")}&am=${showReceipt.totalAmount}&cu=INR`;
                  setUpiQR(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[13px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                <QrCode size={18} /> Show UPI QR
              </button>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => printReceipt(showReceipt)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  <Printer size={16} /> Print Roll
                </button>
                <button
                  onClick={() => setShowReceipt(null)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <X size={16} /> Dismise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Payments */}
      {upiQR && (
        <div style={s.modal} onClick={() => setUpiQR(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: 32,
              borderRadius: 24,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Scan to Pay</h2>
            <img
              src={upiQR}
              alt="UPI QR"
              style={{ width: 250, height: 250, borderRadius: 12 }}
            />
            <p
              style={{
                marginTop: 16,
                fontWeight: 700,
                fontSize: 18,
                color: "var(--purple)",
              }}
            >
              ₹{showReceipt?.totalAmount}
            </p>
            <button
              onClick={() => setUpiQR(null)}
              style={{
                marginTop: 24,
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: "var(--bg3)",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
