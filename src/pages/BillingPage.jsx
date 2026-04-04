import { useState, useEffect } from "react";
import { billingApi, khataApi } from "../api";
import { useInventory } from "../context/InventoryContext";
import { jsPDF } from "jspdf";

export default function BillingPage() {
  const { items, refreshInventory } = useInventory();
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: "", contact: "" });
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [view, setView] = useState("new"); // 'new' or 'history'
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (view === "history") loadHistory();
  }, [view]);

  const loadHistory = async () => {
    try {
      const { data } = await billingApi.getAll();
      setInvoices(data);
    } catch (e) {}
  };

  const addToCart = (item) => {
    if (item.quantity <= 0) return alert("Out of stock!");
    setCart((prev) => {
      const ex = prev.find((i) => i._id === item._id);
      if (ex)
        return prev.map((i) =>
          i._id === item._id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, n) => {
    const item = items.find((i) => i._id === id);
    if (n > item.quantity) return alert(`Only ${item.quantity} in stock`);
    if (n <= 0) return setCart((prev) => prev.filter((i) => i._id !== id));
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, qty: n } : i)));
  };

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const gstTotal = cart.reduce(
    (a, c) => a + (c.price * c.qty * (c.gstRate || 0)) / 100,
    0,
  );
  const grandTotal = Math.max(0, subtotal + gstTotal - discount);

  const getWhatsAppLink = (invoice) => {
    const text = `*Invoice from InventIQ*%0A------------------%0AClient: ${invoice.customerName}%0AItems:%0A${invoice.items.map((i) => `- ${i.itemName} x ${i.quantity} = ₹${i.total}`).join("%0A")}%0A------------------%0ATotal: ₹${invoice.grandTotal}%0AStatus: ${invoice.status}%0AThank you!`;
    return `https://wa.me/${invoice.customerContact.replace(/\D/g, "")}?text=${text}`;
  };

  const generateBill = async () => {
    if (!cart.length) return alert("Cart is empty");
    setLoading(true);
    try {
      const payload = {
        customerName: customer.name || "Walk-in Customer",
        customerContact: customer.contact,
        items: cart.map((c) => ({ ...c, quantity: c.qty })),
        paymentMethod,
        discount,
        status: paymentMethod === "Udhaar" ? "Unpaid" : "Paid",
      };
      const { data: newInvoice } = await billingApi.create(payload);

      // Integration with Khata Book for Udhaar
      if (paymentMethod === "Udhaar" && customer.contact) {
        try {
          // Attempt to register/update customer in Khata Book
          let khataCust;
          const { data: allCusts } = await khataApi.getCustomers();
          khataCust = allCusts.find((c) => c.phone === customer.contact);

          if (!khataCust) {
            const { data: created } = await khataApi.addCustomer({
              name: customer.name || "Walk-in",
              phone: customer.contact,
            });
            khataCust = created;
          }

          // Record the Credit Transaction
          await khataApi.addTransaction({
            customerId: khataCust._id,
            amount: grandTotal,
            type: "CREDIT",
            note: `Invoice #${newInvoice._id.slice(-6)}`,
          });
        } catch (khataErr) {
          console.error("Khata Auto-sync failed:", khataErr);
        }
      }

      alert("Bill generated successfully!");

      // Automatic WhatsApp Receipt Prompt if contact exists
      if (customer.contact) {
        if (window.confirm("Send receipt to WhatsApp?")) {
          window.open(getWhatsAppLink(newInvoice), "_blank");
        }
      }

      setCart([]);
      setCustomer({ name: "", contact: "" });
      setPaymentMethod("Cash");
      setDiscount(0);
      setShowQR(false);
      refreshInventory();
      setView("history");
    } catch (e) {
      alert("Failed to generate bill");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(109, 40, 217); // Purple color
    doc.text("INVENTIQ", pageWidth / 2, y, { align: "center" });

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Smart Inventory Management", pageWidth / 2, y, {
      align: "center",
    });

    y += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", margin, y);

    // Invoice details
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: ${invoice._id.slice(-6).toUpperCase()}`, margin, y);
    y += 6;
    doc.text(
      `Date: ${new Date(invoice.createdAt).toLocaleString()}`,
      margin,
      y,
    );
    y += 6;
    doc.text(`Payment: ${invoice.paymentMethod}`, margin, y);

    // Customer details
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Bill To:", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(invoice.customerName, margin, y);
    if (invoice.customerContact) {
      y += 6;
      doc.text(`Contact: ${invoice.customerContact}`, margin, y);
    }

    // Table header
    y += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, "F");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Item", margin + 2, y);
    doc.text("Qty", margin + 70, y);
    doc.text("Price", margin + 90, y);
    doc.text("GST", margin + 115, y);
    doc.text("Total", margin + 140, y);

    // Items
    y += 10;
    invoice.items.forEach((item) => {
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(item.itemName.substring(0, 30), margin + 2, y);
      doc.text(String(item.quantity), margin + 70, y);
      doc.text(`₹${item.price.toFixed(2)}`, margin + 90, y);
      doc.text(`${item.gstRate || 0}%`, margin + 115, y);
      doc.text(`₹${item.total.toFixed(2)}`, margin + 140, y);
      y += 8;
    });

    // Totals
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Subtotal:`, margin + 100, y);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, margin + 140, y);

    y += 7;
    doc.text(`GST:`, margin + 100, y);
    doc.text(`₹${invoice.totalGst.toFixed(2)}`, margin + 140, y);

    if (invoice.discount > 0) {
      y += 7;
      doc.text(`Discount:`, margin + 100, y);
      doc.text(`-₹${invoice.discount.toFixed(2)}`, margin + 140, y);
    }

    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(109, 40, 217);
    doc.text(`Grand Total: ₹${invoice.grandTotal.toFixed(2)}`, margin + 90, y);

    // Footer
    y += 20;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
    doc.text("Powered by InventIQ - Apni Dukaan, Apna AI", pageWidth / 2, y, {
      align: "center",
    });

    doc.save(`Invoice_${invoice._id.slice(-6)}.pdf`);
  };

  return (
    <div>
      {showQR && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 16,
              textAlign: "center",
              maxWidth: 400,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Scan to Pay</h2>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`}
              alt="UPI QR"
            />
            <div
              style={{
                marginTop: 16,
                fontSize: 20,
                fontWeight: 700,
                color: "var(--purple)",
              }}
            >
              ₹{grandTotal.toFixed(2)}
            </div>
            <p style={{ marginTop: 20, color: "var(--muted)" }}>
              Ask customer to scan and pay via any UPI app.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowQR(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "white",
                }}
              >
                Cancel
              </button>
              <button
                onClick={generateBill}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: "none",
                  background: "var(--green)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Payment Received
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Billing & Invoices
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Send bills to customers and view history
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 4,
          }}
        >
          <button
            onClick={() => setView("new")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              background: view === "new" ? "var(--purple)" : "transparent",
              border: "none",
              color: view === "new" ? "white" : "var(--muted)",
              cursor: "pointer",
            }}
          >
            New Bill
          </button>
          <button
            onClick={() => setView("history")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              background: view === "history" ? "var(--purple)" : "transparent",
              border: "none",
              color: view === "history" ? "white" : "var(--muted)",
              cursor: "pointer",
            }}
          >
            History
          </button>
        </div>
      </div>

      {view === "new" ? (
        <div
          className="grid-mobile-1"
          style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}
        >
          {/* Products List */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              border: "1px solid var(--border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Select Products</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => addToCart(item)}
                  style={{
                    padding: 14,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    opacity: item.quantity <= 0 ? 0.5 : 1,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        item.quantity <= 5 ? "var(--coral)" : "var(--muted)",
                    }}
                  >
                    Stock: {item.quantity} {item.unit}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--purple)",
                      fontWeight: 700,
                    }}
                  >
                    ₹{item.price}{" "}
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>
                      + {item.gstRate || 0}% GST
                    </span>
                  </div>
                  {item.isPacked && (
                    <div
                      style={{
                        fontSize: 10,
                        background: "#D1FAE5",
                        color: "#065F46",
                        padding: "2px 6px",
                        borderRadius: 4,
                        alignSelf: "flex-start",
                      }}
                    >
                      Packed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cart / Invoice Gen */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "1px solid var(--border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 160px)",
            }}
          >
            <div
              style={{ padding: 16, borderBottom: "1px solid var(--border)" }}
            >
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>
                Customer Details
              </h3>
              <input
                placeholder="Name (optional)"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  outline: "none",
                }}
              />
              <input
                placeholder="WhatsApp Number"
                value={customer.contact}
                onChange={(e) =>
                  setCustomer({ ...customer, contact: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {cart.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    borderBottom: "1px dashed var(--border)",
                    paddingBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      ₹{c.price} x {c.qty}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      ₹
                      {(c.price * c.qty * (1 + (c.gstRate || 0) / 100)).toFixed(
                        2,
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        onClick={() => updateQty(c._id, c.qty - 1)}
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: "1px solid var(--border)",
                          background: "white",
                        }}
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQty(c._id, c.qty + 1)}
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: "1px solid var(--border)",
                          background: "white",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: 16,
                borderTop: "1px solid var(--border)",
                background: "var(--bg2)",
              }}
            >
              <h4
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Payment Method
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {["Cash", "UPI", "Online", "Udhaar"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      padding: "8px",
                      borderRadius: 6,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background:
                        paymentMethod === m ? "var(--purple)" : "white",
                      color: paymentMethod === m ? "white" : "var(--text)",
                      cursor: "pointer",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "var(--muted)" }}>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                <span style={{ color: "var(--muted)" }}>Total GST</span>
                <span>₹{gstTotal.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                <span style={{ color: "var(--muted)" }}>Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(+e.target.value)}
                  style={{
                    width: 70,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    textAlign: "right",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--purple)",
                  marginBottom: 16,
                }}
              >
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                disabled={loading || !cart.length}
                onClick={() =>
                  ["UPI", "Online"].includes(paymentMethod)
                    ? setShowQR(true)
                    : generateBill()
                }
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 8,
                  background:
                    paymentMethod === "Udhaar"
                      ? "var(--coral)"
                      : "var(--green)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {loading
                  ? "Processing..."
                  : ["UPI", "Online"].includes(paymentMethod)
                    ? "Generate QR Code"
                    : paymentMethod === "Udhaar"
                      ? "Add to Khata Book"
                      : "Complete Bill"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 20,
            border: "1px solid var(--border)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--border)",
                  fontSize: 12,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: 12 }}>Date</th>
                <th style={{ padding: 12 }}>Customer</th>
                <th style={{ padding: 12 }}>Items</th>
                <th style={{ padding: 12 }}>Payment</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv._id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: 12, fontSize: 13 }}>
                    {new Date(inv.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: 12, fontSize: 13, fontWeight: 500 }}>
                    {inv.customerName}
                    <br />
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {inv.customerContact}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    {inv.items.length} products
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        background:
                          inv.paymentMethod === "Udhaar"
                            ? "#FEE2E2"
                            : "#E0E7FF",
                        color:
                          inv.paymentMethod === "Udhaar"
                            ? "#991B1B"
                            : "#3730A3",
                      }}
                    >
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--green)",
                    }}
                  >
                    ₹{inv.grandTotal.toFixed(2)}
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => generatePDF(inv)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--purple)",
                          background: "white",
                          color: "var(--purple)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        PDF
                      </button>
                      <button
                        onClick={() =>
                          window.open(getWhatsAppLink(inv), "_blank")
                        }
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #25D366",
                          background: "white",
                          color: "#25D366",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
