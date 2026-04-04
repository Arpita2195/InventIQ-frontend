import { useInventory } from "../context/InventoryContext";
import InventoryTable from "../components/InventoryTable";

export default function InventoryPage() {
  const { items, loading, refreshInventory } = useInventory();

  const stats = [
    {
      label: "Total Items",
      value: items.length,
      color: "var(--purple)",
      bg: "var(--purple-xl)",
    },
    {
      label: "Low Stock",
      value: items.filter((i) => i.quantity <= i.lowStockThreshold).length,
      color: "var(--coral)",
      bg: "var(--coral-xl)",
    },
    {
      label: "Total Value",
      value: `₹${items.reduce((a, i) => a + i.quantity * i.price, 0).toLocaleString()}`,
      color: "var(--amber)",
      bg: "var(--amber-xl)",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Inventory
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Manage your shop stock
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "16px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 26,
                fontWeight: 700,
                color: s.color,
                marginTop: 6,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--muted)",
            background: "white",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}
        >
          Loading inventory...
        </div>
      ) : (
        <InventoryTable items={items} onRefresh={refreshInventory} />
      )}
    </div>
  );
}
