import { useState } from "react";
import { useMarket } from "../context/MarketContext";

const CATEGORIES = ["API Tool", "ML Model", "SDK", "Framework", "Security", "Integration", "Database", "Library", "Other"];
const ICONS = ["📦", "⚡", "📊", "🎨", "🕸️", "🛡️", "🔗", "💾", "🐝", "🔧", "🧩", "🚀"];

export default function CreateProductForm({ onClose }) {
  const { createProduct, currentAgent } = useMarket();
  const [form, setForm] = useState({
    name: "",
    category: "API Tool",
    price: "",
    icon: "📦",
    description: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSubmitting(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    await createProduct({
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      icon: form.icon,
      description: form.description,
      tags,
    });
    setSubmitting(false);
    onClose();
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 14px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-primary)",
    fontSize: 13,
    outline: "none",
  };

  const labelStyle = {
    fontSize: 11,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: 600,
    marginBottom: 4,
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>List a Product</h2>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>
        Selling as <strong style={{ color: currentAgent?.color }}>{currentAgent?.name}</strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Product Name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. DataCrunch Pro" required />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Price (credits)</label>
            <input style={inputStyle} type="number" step="0.1" min="0.1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Icon</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ICONS.map((ic) => (
              <button type="button" key={ic} onClick={() => setForm({ ...form, icon: ic })} style={{
                width: 36, height: 36, borderRadius: 6, border: form.icon === ic ? `2px solid ${currentAgent?.color || "var(--accent)"}` : "1px solid var(--border)",
                background: form.icon === ic ? `${currentAgent?.color || "var(--accent)"}15` : "var(--bg)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>{ic}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what your product does..." />
        </div>

        <div>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input style={inputStyle} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="API, Fast, Enterprise" />
        </div>

        <button type="submit" disabled={submitting || !form.name || !form.price} style={{
          width: "100%", padding: "12px", background: currentAgent?.color || "var(--accent)", color: "#000", border: "none", borderRadius: 8,
          fontWeight: 800, fontSize: 14, cursor: submitting ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: 1, opacity: submitting ? 0.6 : 1,
        }}>
          {submitting ? "Listing..." : "List Product"}
        </button>
      </div>
    </form>
  );
}
