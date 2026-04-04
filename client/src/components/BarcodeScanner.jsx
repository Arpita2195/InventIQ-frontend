import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState("");

  // Auto focus manual input for USB physical scanners
  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    let reader = new BrowserMultiFormatReader();
    let isComponentMounted = true;

    const startScanner = async () => {
      try {
        // Find best back-facing camera
        const devices = await reader.listVideoInputDevices();
        if (devices.length === 0) throw new Error("No camera found on your device.");
        
        const deviceId = devices.length > 1 ? devices[1].deviceId : devices[0].deviceId;
        
        if (isComponentMounted && videoRef.current) {
          await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
            if (isComponentMounted && result && result.text) {
              onScan(result.text); 
            }
          });
          if (isComponentMounted) setLoading(false);
        }
      } catch (err) {
        if (isComponentMounted) {
           setError(err.message || "Failed to start camera. Please check permissions.");
           setLoading(false);
        }
      }
    };

    // Small delay for DOM mounting safety
    const timer = setTimeout(() => startScanner(), 200);

    return () => {
      isComponentMounted = false;
      clearTimeout(timer);
      reader.reset();
    };
  }, [onScan]);

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={headerStyle}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>📷 Scan Barcode</div>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ 
            width: "100%", height: 260, position: "relative", 
            background: "#0f172a", borderRadius: 12, overflow: "hidden", marginTop: 20,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {loading && <div style={{ color: "white", fontSize: 14 }}>Waking up camera...</div>}
            {error && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", padding: 20 }}>{error}</div>}
            
            <video 
              ref={videoRef} 
              style={{ width: "100%", height: "100%", objectFit: "cover", display: error ? "none" : "block" }} 
            />
            
            {!loading && !error && (
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 250, height: 100, border: "2px solid #22c55e", borderRadius: 8,
                boxShadow: "0 0 0 4000px rgba(0,0,0,0.5)"
              }}/>
            )}
          </div>
          
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            Point your camera at the barcode, or enter manually:
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if(manualCode.trim()){
              onScan(manualCode.trim());
            }
          }} style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Or scan using USB gun / Enter ID..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--bg3)",
                fontSize: 14, outline: "none"
              }}
            />
            <button type="submit" style={{
              padding: "10px 16px", borderRadius: 8, background: "var(--purple)",
              border: "none", color: "white", fontWeight: 600, cursor: "pointer"
            }}>Apply</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const modalStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
};

const modalContentStyle = {
  background: "white", borderRadius: 16, width: 440, maxWidth: "95%",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden"
};

const headerStyle = {
  padding: "16px 20px", borderBottom: "1px solid var(--border)",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const closeBtnStyle = {
  background: "var(--bg3)", border: "none", width: 32, height: 32,
  borderRadius: 8, fontSize: 14, cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center"
};
