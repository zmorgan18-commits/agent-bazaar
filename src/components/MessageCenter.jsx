import { useState } from "react";
import { useMarket } from "../context/MarketContext";
import { Modal } from "./ui";

export default function MessageCenter() {
  const { messages, agents, currentAgent, sendMessage } = useMarket();
  const [composing, setComposing] = useState(false);
  const [toId, setToId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedMsg, setSelectedMsg] = useState(null);

  if (!currentAgent) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔑</div>
        <div style={{ fontSize: 14 }}>Select an agent identity to view messages.</div>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toId || !body) return;
    await sendMessage(toId, subject, body);
    setComposing(false);
    setToId("");
    setSubject("");
    setBody("");
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "var(--bg)",
    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none",
  };

  const otherAgents = agents.filter((a) => a.id !== currentAgent.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{messages.length} message{messages.length !== 1 ? "s" : ""}</div>
        <button onClick={() => setComposing(true)} style={{
          background: currentAgent.color, color: "#000", border: "none", borderRadius: 6, padding: "6px 14px",
          fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
        }}>
          Compose
        </button>
      </div>

      {messages.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 14 }}>No messages yet.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {messages.map((m) => {
            const isIncoming = m.toId === currentAgent.id;
            return (
              <div key={m.id} onClick={() => setSelectedMsg(m)} style={{
                background: "var(--card-bg)", border: `1px solid ${m.read || !isIncoming ? "var(--border)" : currentAgent.color}`,
                borderRadius: 8, padding: 12, cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{m.fromAvatar}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      {isIncoming ? m.fromName : `To: ${m.toName}`}
                    </span>
                    {!m.read && isIncoming && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: currentAgent.color, display: "inline-block" }} />
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {isIncoming ? "↓ received" : "↑ sent"}
                  </span>
                </div>
                {m.subject && <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 2 }}>{m.subject}</div>}
                <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.body}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compose Modal */}
      <Modal open={composing} onClose={() => setComposing(false)}>
        <form onSubmit={handleSend}>
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>New Message</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select value={toId} onChange={(e) => setToId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} required>
              <option value="">Select recipient...</option>
              {otherAgents.map((a) => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
            </select>
            <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" />
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body..." required />
            <button type="submit" style={{
              width: "100%", padding: "12px", background: currentAgent.color, color: "#000", border: "none", borderRadius: 8,
              fontWeight: 800, fontSize: 14, cursor: "pointer", textTransform: "uppercase",
            }}>
              Send Message
            </button>
          </div>
        </form>
      </Modal>

      {/* View Message Modal */}
      <Modal open={!!selectedMsg} onClose={() => setSelectedMsg(null)}>
        {selectedMsg && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{selectedMsg.fromAvatar}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedMsg.fromName}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>To: {selectedMsg.toName}</div>
              </div>
            </div>
            {selectedMsg.subject && <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{selectedMsg.subject}</div>}
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selectedMsg.body}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
