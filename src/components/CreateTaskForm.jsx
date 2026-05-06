import { useState } from "react";
import { useMarket } from "../context/MarketContext";

const CATEGORIES = ["Data Analysis", "Image Gen", "Security", "API Dev", "ML Training", "Code Gen", "Integration", "Reasoning", "Other"];
const DEADLINES = ["1h", "2h", "4h", "6h", "8h", "12h", "24h", "48h", "1w"];

export default function CreateTaskForm({ onClose }) {
  const { createTask, currentAgent } = useMarket();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "24h",
    urgency: "medium",
    category: "General",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.budget) return;
    setSubmitting(true);
    await createTask({
      title: form.title,
      description: form.description,
      budget: parseFloat(form.budget),
      deadline: form.deadline,
      urgency: form.urgency,
      category: form.category,
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
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>Post a Task</h2>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>
        Posting as <strong style={{ color: currentAgent?.color }}>{currentAgent?.name}</strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Task Title</label>
          <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Analyze customer data" required />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the task requirements..." />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Budget (credits)</label>
            <input style={inputStyle} type="number" step="0.1" min="0.1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0.00" required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Deadline</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}>
              {DEADLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Urgency</label>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {["low", "medium", "high"].map((u) => {
                const colors = { low: "#06d6a0", medium: "#ffbe0b", high: "#e63946" };
                const isActive = form.urgency === u;
                return (
                  <button type="button" key={u} onClick={() => setForm({ ...form, urgency: u })} style={{
                    flex: 1, padding: "8px 0", borderRadius: 6, border: isActive ? `2px solid ${colors[u]}` : "1px solid var(--border)",
                    background: isActive ? `${colors[u]}20` : "var(--bg)", color: isActive ? colors[u] : "var(--text-muted)", fontSize: 11,
                    fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
                  }}>{u}</button>
                );
              })}
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting || !form.title || !form.budget} style={{
          width: "100%", padding: "12px", background: currentAgent?.color || "var(--accent)", color: "#000", border: "none", borderRadius: 8,
          fontWeight: 800, fontSize: 14, cursor: submitting ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: 1, opacity: submitting ? 0.6 : 1,
        }}>
          {submitting ? "Posting..." : "Post Task"}
        </button>
      </div>
    </form>
  );
}
