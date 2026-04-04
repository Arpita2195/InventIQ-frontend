import { useState, useEffect } from "react";
import { inventoryApi } from "../api";
import { useSearchParams } from "react-router-dom";

const categoryIcons = {
  Dairy: "🥛",
  Grocery: "🍞",
  Snacks: "🍿",
  Beverages: "🥤",
  Cleaning: "🧼",
  "Toiletries / Personal Care": "🧴",
  "Stationery / Office": "✏️",
  "Household items": "🏠",
  General: "📦",
};

export default function InventoryTable({ items = [], onRefresh }) {
  const [searchParams] = useSearchParams();
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    brandName: "",
    packSize: "",
    category: "General",
    quantity: 0,
    unit: "pcs",
    mrp: 0,
    price: 0,
    purchasePrice: 0,
    gstRate: 0,
    hsnCode: "",
    isPacked: true,
    supplierName: "",
    supplierContact: "",
    supplierEmail: "",
    lowStockThreshold: 5,
  });
  const [search, setSearch] = useState(searchParams.get("s") || "");

  useEffect(() => {
    const s = searchParams.get("s");
    if (s) setSearch(s);
  }, [searchParams]);
  const [isListening, setIsListening] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleNameBlur = async (name, isEdit = false) => {
    if (!name) return;
    setIsPredicting(true);
    try {
      const { data } = await inventoryApi.predictGST(name);
      if (data && !data.error) {
        if (isEdit) {
          setEditVal((prev) => ({
            ...prev,
            category: data.cat,
            gstRate: data.rate,
          }));
        } else {
          setNewItem((prev) => ({
            ...prev,
            category: data.cat,
            gstRate: data.rate,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (/[અ-હ]/.test(text)) utterance.lang = "gu-IN";
    else if (/[अ-ह]/.test(text)) utterance.lang = "hi-IN";
    else utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Mic not supported");
    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      try {
        const { data } = await inventoryApi.askAI(transcript);
        speakResponse(data.reply);
      } catch (err) {
        alert("AI error");
      }
    };
    rec.start();
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase()) ||
      i.brandName?.toLowerCase().includes(search.toLowerCase()),
  );

  const startEdit = (item) => {
    setEditing(item._id);
    setEditVal({
      name: item.name,
      brandName: item.brandName || "",
      packSize: item.packSize || "",
      category: item.category || "General",
      quantity: item.quantity,
      mrp: item.mrp || 0,
      price: item.price,
      purchasePrice: item.purchasePrice || 0,
      gstRate: item.gstRate || 0,
      hsnCode: item.hsnCode || "",
      isPacked: item.isPacked || false,
      supplierName: item.supplierName || "",
      supplierContact: item.supplierContact || "",
      supplierEmail: item.supplierEmail || "",
    });
  };
  const saveEdit = async (id) => {
    await inventoryApi.update(id, editVal);
    setEditing(null);
    onRefresh();
  };
  const deleteItem = async (id) => {
    if (window.confirm("Delete this item?")) {
      await inventoryApi.remove(id);
      onRefresh();
    }
  };
  const addItem = async () => {
    if (!newItem.name) return;
    await inventoryApi.add(newItem);
    setAdding(false);
    setNewItem({
      name: "",
      brandName: "",
      packSize: "",
      category: "General",
      quantity: 0,
      unit: "pcs",
      mrp: 0,
      price: 0,
      purchasePrice: 0,
      gstRate: 0,
      hsnCode: "",
      isPacked: true,
      supplierName: "",
      supplierContact: "",
      supplierEmail: "",
      lowStockThreshold: 5,
    });
    onRefresh();
  };

  const notifySupplier = async (id) => {
    try {
      const { data } = await inventoryApi.notifySupplier(id);
      if (data.emailData) {
        alert(data.message + "\n\nSimulated Email:\n" + data.emailData.body);
      } else {
        alert("Check your Top-Right Bell Icon! 🔔\n\n" + data.message);
      }
    } catch (e) {
      alert("Action failed: " + (e.response?.data?.message || e.message));
    }
  };

  const thStyle = {
    fontSize: 11,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
    padding: "10px 14px",
    textAlign: "left",
    borderBottom: "2px solid var(--border)",
    background: "var(--bg3)",
    whiteSpace: "nowrap",
  };
  const tdStyle = {
    padding: "12px 14px",
    fontSize: 13,
    color: "var(--text)",
    borderBottom: "1px solid var(--border)",
  };

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, brands..."
            style={{ ...inputStyle, width: 220 }}
          />
          <button
            onClick={startVoiceAssistant}
            style={{
              background: isListening ? "#FFE4E6" : "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 10px",
              color: isListening ? "var(--coral)" : "var(--muted)",
              cursor: "pointer",
            }}
            title="Ask Voice Assistant"
          >
            🎤
          </button>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            background: "var(--purple)",
            border: "none",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 2px 6px rgba(109,40,217,0.25)",
          }}
        >
          + Add Item
        </button>
      </div>

      {adding && (
        <div
          style={{
            margin: "16px",
            padding: 16,
            background: "var(--bg3)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
          }}
        >
          <input
            placeholder="Brand Name"
            value={newItem.brandName}
            onChange={(e) =>
              setNewItem({ ...newItem, brandName: e.target.value })
            }
            style={inputStyle}
          />
          <input
            placeholder="Item name *"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            onBlur={(e) => handleNameBlur(e.target.value, false)}
            style={{
              gridColumn: "span 2",
              borderColor: isPredicting ? "var(--purple)" : "var(--border)",
              ...inputStyle,
            }}
          />
          <input
            placeholder="Category"
            value={newItem.category}
            onChange={(e) =>
              setNewItem({ ...newItem, category: e.target.value })
            }
            style={inputStyle}
          />
          <input
            placeholder="Pack Size (e.g., 1kg)"
            value={newItem.packSize}
            onChange={(e) =>
              setNewItem({ ...newItem, packSize: e.target.value })
            }
            style={inputStyle}
          />
          <input
            placeholder="Unit (pcs/kg/L)"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Qty"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: +e.target.value })
            }
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Selling Price ₹"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: +e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Purchase Price ₹"
            value={newItem.purchasePrice}
            onChange={(e) =>
              setNewItem({ ...newItem, purchasePrice: +e.target.value })
            }
            style={inputStyle}
          />
          <input
            placeholder="HSN Code"
            value={newItem.hsnCode}
            onChange={(e) =>
              setNewItem({ ...newItem, hsnCode: e.target.value })
            }
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="GST %"
            value={newItem.gstRate}
            onChange={(e) =>
              setNewItem({ ...newItem, gstRate: +e.target.value })
            }
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Low stock alert at"
            value={newItem.lowStockThreshold}
            onChange={(e) =>
              setNewItem({ ...newItem, lowStockThreshold: +e.target.value })
            }
            style={inputStyle}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text)",
              gridColumn: "span 3",
            }}
          >
            <input
              type="checkbox"
              checked={newItem.isPacked}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  isPacked: e.target.checked,
                  gstRate: e.target.checked
                    ? newItem.gstRate === 0
                      ? 5
                      : newItem.gstRate
                    : newItem.gstRate,
                })
              }
            />
            Is Packed?
          </label>
          <div style={{ gridColumn: "1/-1", display: "flex", gap: 8 }}>
            <button
              onClick={addItem}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "var(--teal)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Save Item
            </button>
            <button
              onClick={() => setAdding(false)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-container" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Item Info",
                "Category",
                "Stock",
                "Price ₹",
                "GST %",
                "Total ₹",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: 32,
                  }}
                >
                  No items found
                </td>
              </tr>
            )}
            {filtered.map((item) => {
              const isLow = item.quantity <= item.lowStockThreshold;
              const isEdit = editing === item._id;
              return (
                <tr
                  key={item._id}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FAFBFF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td style={tdStyle}>
                    {isEdit ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <input
                          value={editVal.brandName}
                          onChange={(e) =>
                            setEditVal({
                              ...editVal,
                              brandName: e.target.value,
                            })
                          }
                          placeholder="Brand"
                          style={inputStyle}
                        />
                        <input
                          value={editVal.name}
                          onChange={(e) =>
                            setEditVal({ ...editVal, name: e.target.value })
                          }
                          onBlur={(e) => handleNameBlur(e.target.value, true)}
                          style={{
                            borderColor: isPredicting
                              ? "var(--purple)"
                              : "var(--border)",
                            ...inputStyle,
                          }}
                        />
                        <input
                          value={editVal.packSize}
                          onChange={(e) =>
                            setEditVal({ ...editVal, packSize: e.target.value })
                          }
                          placeholder="Pack Size"
                          style={inputStyle}
                        />
                        <label
                          style={{
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={editVal.isPacked}
                            onChange={(e) =>
                              setEditVal({
                                ...editVal,
                                isPacked: e.target.checked,
                                gstRate: e.target.checked
                                  ? editVal.gstRate === 0
                                    ? 5
                                    : editVal.gstRate
                                  : editVal.gstRate,
                              })
                            }
                          />
                          Packed?
                        </label>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            flexShrink: 0,
                          }}
                        >
                          {categoryIcons[item.category] || "📦"}
                        </div>
                        <div>
                          {item.brandName && (
                            <div
                              style={{ fontSize: 11, color: "var(--muted)" }}
                            >
                              {item.brandName}
                            </div>
                          )}
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--text)",
                              fontSize: 14,
                            }}
                          >
                            {item.name}
                          </div>
                          {item.packSize && (
                            <div
                              style={{ fontSize: 11, color: "var(--muted)" }}
                            >
                              Size: {item.packSize}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEdit ? (
                      <input
                        value={editVal.category}
                        onChange={(e) =>
                          setEditVal({ ...editVal, category: e.target.value })
                        }
                        style={{ ...inputStyle, width: 100 }}
                        placeholder="Category"
                      />
                    ) : (
                      <>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--purple)",
                            background: "var(--purple-xl)",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 500,
                          }}
                        >
                          {item.category}
                        </span>
                        {item.isPacked && (
                          <div
                            style={{
                              fontSize: 10,
                              marginTop: 4,
                              background: "#D1FAE5",
                              color: "#065F46",
                              padding: "2px 6px",
                              borderRadius: 4,
                              display: "inline-block",
                            }}
                          >
                            Packed
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEdit ? (
                      <input
                        type="number"
                        value={editVal.quantity}
                        onChange={(e) =>
                          setEditVal({ ...editVal, quantity: +e.target.value })
                        }
                        style={{ ...inputStyle, width: 70 }}
                      />
                    ) : (
                      <span
                        style={{
                          fontWeight: 700,
                          color: isLow ? "var(--coral)" : "var(--text)",
                          fontSize: 15,
                        }}
                      >
                        {item.quantity} {item.unit}
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEdit ? (
                      <input
                        type="number"
                        value={editVal.price}
                        onChange={(e) =>
                          setEditVal({ ...editVal, price: +e.target.value })
                        }
                        placeholder="Price"
                        style={{ ...inputStyle, width: 60 }}
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>₹{item.price}</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEdit ? (
                      <input
                        type="number"
                        value={editVal.gstRate}
                        onChange={(e) =>
                          setEditVal({ ...editVal, gstRate: +e.target.value })
                        }
                        placeholder="GST%"
                        style={{ ...inputStyle, width: 50 }}
                      />
                    ) : (
                      <span style={{ fontWeight: 500, color: "var(--coral)" }}>
                        {item.gstRate || 0}%
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: "var(--green)" }}>
                      ₹
                      {(
                        item.price +
                        (item.price * (item.gstRate || 0)) / 100
                      ).toFixed(2)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontWeight: 600,
                        background: isLow
                          ? "var(--coral-xl)"
                          : "var(--green-xl)",
                        color: isLow ? "var(--coral)" : "var(--green)",
                        border: `1px solid ${isLow ? "#FECDD3" : "#A7F3D0"}`,
                      }}
                    >
                      {isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isEdit ? (
                        <>
                          <button
                            onClick={() => saveEdit(item._id)}
                            style={actionBtn("#0D9488", "#CCFBF1")}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            style={actionBtn("#64748B", "#F1F5F9")}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            style={actionBtn("#6D28D9", "#EDE9FE")}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            style={actionBtn("#E11D48", "#FFE4E6")}
                          >
                            Del
                          </button>
                          {isLow && (
                            <button
                              onClick={() => notifySupplier(item._id)}
                              style={actionBtn("#D97706", "#FEF3C7")}
                              title="Send Restock Email"
                            >
                              Notify
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "white",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 13,
  color: "var(--text)",
  outline: "none",
  width: "100%",
};
const actionBtn = (color, bg) => ({
  fontSize: 11,
  padding: "5px 10px",
  borderRadius: 6,
  background: bg,
  border: `1px solid ${color}30`,
  color: color,
  cursor: "pointer",
  fontWeight: 500,
});
