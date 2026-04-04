import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import ChatWindow from "../components/ChatWindow";
import OfferPreviewCard from "../components/OfferPreviewCard";

export default function ChatPage() {
  const [lastOffer, setLastOffer] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshInventory } = useInventory();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          AI Chat Assistant
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Hindi, Gujarati ya English mein baat karein — stock update, alerts,
          aur offers
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          height: "calc(100vh - 180px)",
        }}
      >
        <ChatWindow
          key={refreshKey}
          onInventoryUpdate={() => {
            setRefreshKey((k) => k + 1);
            refreshInventory();
          }}
          onOfferGenerated={setLastOffer}
        />

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {lastOffer && (
            <OfferPreviewCard
              offerText={lastOffer}
              onClear={() => setLastOffer("")}
            />
          )}

          {/* Tips */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 12,
                color: "var(--text)",
              }}
            >
              Try saying...
            </div>
            {[
              { text: '"Kal 30 packet Maggi aaye"', action: "Stock update" },
              {
                text: '"Sab kuch check karo, kya kam hai?"',
                action: "Low stock",
              },
              { text: '"Aaj tomato offer pe dalo"', action: "Offer" },
              { text: '"Is hafte kitna bika?"', action: "Sales report" },
              { text: '"Rice ka stock 50 set karo"', action: "Set stock" },
              { text: '"Bread ko inventory se hatao"', action: "Remove item" },
              { text: '"Aaj ka revenue kya hai?"', action: "Revenue check" },
            ].map((t) => (
              <div
                key={t.text}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 12,
                }}
              >
                <div style={{ color: "var(--text)", fontStyle: "italic" }}>
                  {t.text}
                </div>
                <div
                  style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}
                >
                  → {t.action}
                </div>
              </div>
            ))}
          </div>

          {/* Language guide */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 10,
                color: "var(--text)",
              }}
            >
              Supported Languages
            </div>
            {[
              ["🇮🇳", "Hindi", "हिंदी में बात करें"],
              ["🇮🇳", "Gujarati", "ગુજરાતીમાં વાત"],
              ["🇬🇧", "English", "Chat in English"],
            ].map(([flag, lang, eg]) => (
              <div
                key={lang}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "6px 0",
                  fontSize: 12,
                }}
              >
                <span style={{ fontSize: 16 }}>{flag}</span>
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 500 }}>
                    {lang}
                  </div>
                  <div style={{ color: "var(--muted)" }}>{eg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
