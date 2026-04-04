import { useState, useRef, useEffect } from "react";
import { chatApi } from "../api";
import { 
  Mic, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCcw, 
  Trash2,
  BrainCircuit,
  Languages
} from "lucide-react";
import { cn } from "../lib/utils";

const BubbleUser = ({ text }) => (
  <div className="flex justify-end mb-6 animate-fadeIn">
    <div className="max-w-[80%] bg-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-none shadow-lg shadow-indigo-100 text-[14.5px] leading-relaxed font-medium">
      {text}
    </div>
  </div>
);

const BubbleAI = ({ text, action, isSpeaking, onSpeak }) => {
  const actionColors = {
    UPDATE_INVENTORY: "bg-emerald-50 text-emerald-700 border-emerald-100",
    LOW_STOCK_CHECK: "bg-amber-50 text-amber-700 border-amber-100",
    GENERATE_OFFER: "bg-cyan-50 text-cyan-700 border-cyan-100",
    ADD_ITEM: "bg-indigo-50 text-indigo-700 border-indigo-100",
    REMOVE_ITEM: "bg-rose-50 text-rose-700 border-rose-100",
    SALES_SUMMARY: "bg-violet-50 text-violet-700 border-violet-100",
    UPDATE_PRICE: "bg-orange-50 text-orange-700 border-orange-100",
  };
  
  const actionLabels = {
    UPDATE_INVENTORY: "Inventory Updated",
    LOW_STOCK_CHECK: "Stock Analysis",
    GENERATE_OFFER: "Promotion Ready",
    ADD_ITEM: "Product Added",
    REMOVE_ITEM: "Product Removed",
    SALES_SUMMARY: "Business Report",
    UPDATE_PRICE: "Pricing Updated",
  };

  const ac = actionColors[action] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <div className="flex gap-4 mb-6 items-start animate-fadeIn group">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0 flex items-center justify-center shadow-lg shadow-indigo-100">
        <BrainCircuit size={20} className="text-white" />
      </div>
      <div className="max-w-[85%] flex-1">
        {action && action !== "NONE" && (
          <div className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-2 inline-flex items-center gap-1.5 shadow-sm", ac)}>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {actionLabels[action] || action}
          </div>
        )}
        <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm shadow-slate-200/50 hover:shadow-md transition-all duration-300 relative group/bubble">
          <div className="text-[14.5px] leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
            {text}
          </div>
          <button
            onClick={onSpeak}
            className="absolute -right-10 top-0 p-2 text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
            title={isSpeaking ? "Stop Speaking" : "Listen Message"}
          >
            {isSpeaking ? <VolumeX size={18} className="animate-pulse" /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-4 mb-6 items-start animate-fadeIn">
    <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center">
      <BrainCircuit size={20} className="text-slate-400" />
    </div>
    <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-300"
          style={{
            animation: "bounce 1.2s infinite ease-in-out both",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.3)}40%{transform:scale(1)}}`}</style>
    </div>
  </div>
);

const suggestions = [
  { text: "Aaj ka stock dikhao", icon: "📊" },
  { text: "Low stock kya hai?", icon: "⚠️" },
  { text: "Diwali offer banao", icon: "🎁" },
  { text: "20 Maggi packets aaye", icon: "➕" },
  { text: "Weekly sales report", icon: "📈" },
];

export default function ChatWindow({ onInventoryUpdate }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste! Main InventIQ hoon. Aap apni dukaan ke baare mein kuch bhi pooch sakte hain — stock update, inventory status, ya special offers banana. Main Hindi, Gujarati aur English samajh sakta hoon.",
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
      };
      setMessages((prev) => [...prev, newMessage]);
      
      if (
        ["UPDATE_INVENTORY", "ADD_ITEM", "REMOVE_ITEM", "UPDATE_PRICE"].includes(data.action)
      ) {
        onInventoryUpdate?.();
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf kijiye, kuch connectivity issues hain. Please dobara koshish karein.",
          action: "NONE",
        },
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

    recognitionRef.current.onerror = (e) => {
      console.error("Speech error", e);
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

  const speakMessage = (text, index) => {
    if (!window.speechSynthesis) return;
    
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingIndex(index);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1;
    
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    if (confirm("Clear chat history?")) {
      setMessages([messages[0]]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40 animate-fadeIn">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 relative">
            <Sparkles className="text-white w-6 h-6" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="text-[16px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              InventIQ Expert
              <Badge variant="primary" className="text-[9px] py-0 px-2 h-4">Pro</Badge>
            </div>
            <div className="text-[11.5px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
               Online · AI Multi-lingual Support
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-slate-100"
            title="Clear Chat"
          >
            <Trash2 size={19} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-8 py-8 bg-slate-50/30 custom-scrollbar">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <BubbleUser key={i} text={m.content} />
          ) : (
            <BubbleAI
              key={i}
              text={m.content}
              action={m.action}
              isSpeaking={speakingIndex === i}
              onSpeak={() => speakMessage(m.content, i)}
            />
          ),
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2.5 mb-6 animate-fadeIn">
            {suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => send(s.text)}
                className="text-[13px] font-medium px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <span className="text-sm">{s.icon}</span>
                {s.text}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3.5 bg-slate-50 border border-slate-200 rounded-[22px] p-2.5 shadow-sm focus-within:shadow-md focus-within:border-indigo-300 focus-within:bg-white transition-all duration-300">
          <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm grow-0 shrink-0">
             <Languages size={16} className="text-indigo-600" />
             <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent border-none text-[12px] font-bold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="gu-IN">GUJ</option>
              <option value="hi-IN">HIN</option>
              <option value="en-IN">ENG</option>
            </select>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Poochiye (Hindi, Gujarati ya English)..."
            className="flex-1 bg-transparent border-none py-3 px-1 text-[14.5px] text-slate-900 outline-none resize-none min-h-[44px] max-h-[120px] font-medium placeholder:text-slate-400"
            rows={1}
            style={{ height: input ? "auto" : "44px" }}
          />

          <div className="flex items-center gap-2 pr-1">
            <button
              onClick={voiceActive ? stopVoiceInput : startVoiceInput}
              className={cn(
                "p-3.5 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                voiceActive 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "bg-white text-slate-500 hover:text-indigo-600 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50"
              )}
              title={voiceActive ? "Recording..." : "Voice Input"}
            >
              <Mic size={20} weight="bold" />
            </button>
            
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-100",
                loading || !input.trim()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95"
              )}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        
        <div className="text-center mt-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
            Powered by Groq Llama 3.3
          </span>
        </div>
      </div>
    </div>
  );
}
