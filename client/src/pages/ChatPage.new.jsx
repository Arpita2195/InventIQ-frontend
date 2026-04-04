import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import ChatWindow from "../components/ChatWindow";
import OfferPreviewCard from "../components/OfferPreviewCard";
import { GradientCard, ShimmerButton } from "../components/ui";
import { MessageSquare, Lightbulb, Languages, Sparkles } from "lucide-react";

export default function ChatPage() {
  const [lastOffer, setLastOffer] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshInventory } = useInventory();
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-violet-500" size={28} />
          AI Chat Assistant
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hindi, Gujarati ya English mein baat karein — stock update, alerts, aur offers
        </p>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-6 min-h-0">
        {/* Chat Window */}
        <div className="min-h-0">
          <ChatWindow
            key={refreshKey}
            onInventoryUpdate={() => {
              setRefreshKey((k) => k + 1);
              refreshInventory();
            }}
            onOfferGenerated={setLastOffer}
          />
        </div>

        {/* Right Panel - Hidden on mobile, visible on lg */}
        <div className="hidden lg:flex flex-col gap-4 overflow-auto">
          {lastOffer && (
            <OfferPreviewCard
              offerText={lastOffer}
              onClear={() => setLastOffer("")}
            />
          )}

          {/* Tips Card */}
          <GradientCard gradient="lavender" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-violet-600" />
              <span className="font-semibold text-slate-800 text-sm">Try saying...</span>
            </div>
            <div className="space-y-2">
              {[
                { text: "'Kal 30 packet Maggi aaye'", action: "Stock update" },
                { text: "'Sab kuch check karo, kya kam hai?'", action: "Low stock" },
                { text: "'Aaj tomato offer pe dalo'", action: "Offer" },
                { text: "'Is hafte kitna bika?'", action: "Sales report" },
                { text: "'Rice ka stock 50 set karo'", action: "Set stock" },
                { text: "'Bread ko inventory se hatao'", action: "Remove item" },
                { text: "'Total revenue kya hai?'", action: "Revenue check" },
              ].map((t, i) => (
                <div key={i} className="border-b border-violet-100 last:border-0 pb-2 last:pb-0">
                  <div className="text-xs text-slate-700 italic">{t.text}</div>
                  <div className="text-[10px] text-violet-600 mt-0.5">→ {t.action}</div>
                </div>
              ))}
            </div>
          </GradientCard>

          {/* Language Card */}
          <GradientCard gradient="mint" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Languages size={18} className="text-emerald-600" />
              <span className="font-semibold text-slate-800 text-sm">Supported Languages</span>
            </div>
            <div className="space-y-2">
              {[
                { flag: "🇮🇳", lang: "Hindi", eg: "हिंदी में बात करें" },
                { flag: "🇮🇳", lang: "Gujarati", eg: "ગુજરાતીમાં વાત" },
                { flag: "🇬🇧", lang: "English", eg: "Chat in English" },
              ].map(([flag, lang, eg], i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{flag}</span>
                  <div>
                    <div className="font-medium text-slate-700">{lang}</div>
                    <div className="text-xs text-slate-500">{eg}</div>
                  </div>
                </div>
              ))}
            </div>
          </GradientCard>
        </div>
      </div>
    </div>
  );
}
