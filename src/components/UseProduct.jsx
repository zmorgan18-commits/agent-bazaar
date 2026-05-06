import { useState, useEffect } from "react";
import { useMarket } from "../context/MarketContext";
import * as api from "../api";

export default function UseProduct({ item, onClose }) {
  const { currentAgent } = useMarket();
  const [productInfo, setProductInfo] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!item) return;
    api.getProductInfo(item.productId).then(setProductInfo).catch(() => setProductInfo(null));
  }, [item]);

  if (!item) return null;

  const handleRun = async (e) => {
    e.preventDefault();
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(input);
      } catch {
        parsed = { text: input };
      }
      const res = await api.useProduct(item.id, currentAgent.id, parsed);
      setResult(res);
    } catch (err) {
      setError(err.message);
    }
    setRunning(false);
  };

  const loadExample = () => {
    if (productInfo?.example) {
      setInput(JSON.stringify(productInfo.example, null, 2));
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "var(--bg)",
    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)",
    fontSize: 13, outline: "none", fontFamily: "var(--font-mono)",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 28 }}>{item.productIcon}</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{item.productName}</h2>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Run this product with your input</div>
        </div>
      </div>

      {productInfo && (
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8,
          padding: 12, marginBottom: 14, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>How to use</div>
          {productInfo.description}
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
            Accepts: <strong style={{ color: item.productColor }}>{productInfo.accepts}</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleRun}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Input (JSON or plain text)
          </div>
          {productInfo?.example && (
            <button type="button" onClick={loadExample} style={{
              background: "none", border: `1px solid ${item.productColor}`, borderRadius: 4,
              color: item.productColor, fontSize: 10, fontWeight: 700, padding: "3px 8px",
              cursor: "pointer", textTransform: "uppercase",
            }}>
              Load Example
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={productInfo?.example ? JSON.stringify(productInfo.example) : "Enter your input..."}
          style={{ ...inputStyle, resize: "vertical", minHeight: 80, marginBottom: 10 }}
          required
        />
        <button type="submit" disabled={running || !input.trim()} style={{
          width: "100%", padding: "12px", background: running ? "var(--border)" : item.productColor,
          color: "#000", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14,
          cursor: running ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: 1,
        }}>
          {running ? "Running..." : "Execute"}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: 14, padding: 12, background: "#e6394620", border: "1px solid #e63946",
          borderRadius: 8, color: "#e63946", fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase",
            letterSpacing: 0.8, marginBottom: 8, display: "flex", justifyContent: "space-between",
          }}>
            <span>Output</span>
            <span style={{ color: "#06d6a0" }}>executed at {new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
          <pre style={{
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8,
            padding: 14, fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-mono)",
            overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap", wordBreak: "break-word",
            lineHeight: 1.5, margin: 0,
          }}>
            {JSON.stringify(result.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
