import { useState, useRef, useEffect } from "react";
import { chatApi } from "../api";
import { ShimmerButton, GlowButton } from "./ui";
import { Mic, Send, Volume2, VolumeX, Sparkles } from "lucide-react";

const BubbleUser = ({ text }) => (
  <div className="flex justify-end mb-4">
    <div className="max-w-[80%] sm:max-w-[72%] bg-gradient-to-br from-violet-500 to-purple-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-[0_4px_15px_-3px_rgba(139,92,246,0.4)] animate-fadeIn">
      {text}
    </div>
  </div>
);

const BubbleAI = ({ text, action, isSpeaking, onSpeak }) => {
  const actionColors = {
    UPDATE_INVENTORY: { bg: "from-emerald-50 to-green-50", text: "text-emerald-700", border: "border-emerald-200", icon: "📦" },
    LOW_STOCK_CHECK: { bg: "from-amber-50 to-orange-50", text: "text-amber-700", border: "border-amber-200", icon: "⚠️" },
    GENERATE_OFFER: { bg: "from-rose-50 to-pink-50", text: "text-rose-700", border: "border-rose-200", icon: "🎁" },
    ADD_ITEM: { bg: "from-blue-50 to-cyan-50", text: "text-blue-700", border: "border-blue-200", icon: "➕" },
    REMOVE_ITEM: { bg: "from-red-50 to-rose-50", text: "text-red-700", border: "border-red-200", icon: "🗑️" },
    SALES_SUMMARY: { bg: "from-violet-50 to-purple-50", text: "text-violet-700", border: "border-violet-200", icon: "📊" },
    UPDATE_PRICE: { bg: "from-orange-50 to-amber-50", text: "text-orange-700", border: "border-orange-200", icon: "💰" },
    TOTAL_REVENUE: { bg: "from-green-50 to-emerald-50", text: "text-green-700", border: "border-green-200", icon: "💵" },
  };

  const actionLabels = {
    UPDATE_INVENTORY: "Stock Updated",
    LOW_STOCK_CHECK: "Low Stock Alert",
    GENERATE_OFFER: "Offer Generated",
    ADD_ITEM: "Item Added",
    REMOVE_ITEM: "Item Removed",
    SALES_SUMMARY: "Sales Summary",
    UPDATE_PRICE: "Price Updated",
    TOTAL_REVENUE: "Revenue Report",
  };

  const ac = actionColors[action];

  return (
    <div className="flex gap-3 mb-4 items-start animate-fadeIn">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-[0_4px_12px_-2px_rgba(139,92,246,0.4)]">
        IQ
      </div>
      <div className="max-w-[85%] sm:max-w-[75%]">
        {action && action !== "NONE" && ac && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${ac.bg} ${ac.text} border ${ac.border} mb-2`}>
            <span>{ac.icon}</span>
            <span>{actionLabels[action]}</span>
          </div>
        )}
        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed text-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] relative group">
          <p className="pr-8">{text}</p>
          <button
            onClick={onSpeak}
            className={`absolute bottom-2 right-2 p-2 rounded-lg transition-all duration-200 ${
              isSpeaking ? "bg-violet-100 text-violet-600" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            }`}
            title={isSpeaking ? "Stop speaking" : "Speak message"}
          >
            {isSpeaking ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 mb-4 items-start">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      IQ
    </div>
    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]">
      <div className="flex gap-1.5 items-center h-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const suggestions = [
  "Aaj ka stock dikhao",
  "Low stock kya hai?",
  "Diwali offer banao",
  "20 Maggi packets aaye",
  "Weekly sales summary",
];

export default function ChatWindow({ onInventoryUpdate, onOfferGenerated }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! Main InventIQ hoon. Aap apni dukaan ke baare mein kuch bhi pooch sakte hain — stock update, low stock alert, ya WhatsApp offer banana. Kya madad kar sakta hoon?",
      action: "NONE",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [lang, setLang] = useState("gu-IN");
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const { data } = await chatApi.send(msg);
      const newMessage = {
        role: "assistant",
        content: data.reply,
        action: data.action,
        actionResult: data.actionResult,
      };
      setMessages((prev) => [...prev, newMessage]);
      
      if (data.action === "GENERATE_OFFER" && data.actionResult?.offerText) {
        onOfferGenerated?.(data.actionResult.offerText);
      }

      if (["UPDATE_INVENTORY", "ADD_ITEM", "REMOVE_ITEM", "UPDATE_PRICE"].includes(data.action)) {
        onInventoryUpdate?.();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kuch galat ho gaya. Please dobara try karein.", action: "NONE" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    return recognition;
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }
    if (!recognitionRef.current) return;

    setVoiceActive(true);
    let finalTranscript = "";

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      setInput(finalTranscript + interimTranscript);
    };

    recognitionRef.current.onend = () => {
      setVoiceActive(false);
      if (finalTranscript.trim()) {
        send(finalTranscript);
      }
    };

    recognitionRef.current.onerror = () => {
      setVoiceActive(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceActive(false);
    }
  };

  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-[0_4px_12px_-2px_rgba(139,92,246,0.4)]">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="font-semibold text-slate-800">InventIQ Assistant</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online · AI Powered</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <BubbleUser key={i} text={m.content} />
          ) : (
            <BubbleAI
              key={i}
              text={m.content}
              action={m.action}
              isSpeaking={speakingIndex === i}
              onSpeak={() => {
                setSpeakingIndex(i);
                speakMessage(m.content);
              }}
            />
          ),
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 bg-slate-50 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Hindi, Gujarati, ya English mein likho..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />
          
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="hidden sm:block bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-violet-400 cursor-pointer"
            title="Language"
          >
            <option value="gu-IN">Gujarati</option>
            <option value="hi-IN">Hindi</option>
            <option value="en-IN">English</option>
          </select>

          <GlowButton
            onClick={voiceActive ? stopVoiceInput : startVoiceInput}
            color={voiceActive ? "danger" : "violet"}
            className="px-3 py-3"
            title={voiceActive ? "Stop recording" : "Start voice input"}
          >
            {voiceActive ? <span className="animate-pulse">🔴</span> : <Mic size={18} />}
          </GlowButton>

          <ShimmerButton
            onClick={() => send()}
            disabled={loading || !input.trim()}
            variant="accent"
            className="px-4 py-3 disabled:opacity-50"
          >
            <Send size={18} />
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
