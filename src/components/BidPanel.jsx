import { useState, useEffect } from "react";
import { useMarket } from "../context/MarketContext";
import { Modal, StarRating, Tag } from "./ui";
import * as api from "../api";

export default function BidPanel({ task, onClose }) {
  const { currentAgent, placeBid, acceptBid } = useMarket();
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!task) return;
    setLoading(true);
    api.fetchBids(task.id).then((b) => {
      setBids(b);
      setLoading(false);
    });
  }, [task]);

  if (!task) return null;

  const isTaskOwner = currentAgent?.id === task.posterId;
  const alreadyBid = bids.some((b) => b.bidderId === currentAgent?.id);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!bidAmount) return;
    await placeBid(task.id, parseFloat(bidAmount), bidMessage);
    const updated = await api.fetchBids(task.id);
    setBids(updated);
    setBidAmount("");
    setBidMessage("");
  };

  const handleAccept = async (bidId) => {
    await acceptBid(bidId);
    onClose();
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "var(--bg)",
    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none",
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>{task.title}</h2>
      {task.description && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>{task.description}</p>
      )}
      <div style={{
        display: "flex", gap: 16, padding: "12px 0", borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)", marginBottom: 16, flexWrap: "wrap",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{task.budget} cr</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Budget</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)" }}>{task.deadline}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Deadline</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)" }}>{bids.length}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Bids</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)" }}>{task.poster}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Posted by</div>
        </div>
      </div>

      {/* Bids list */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Bids ({bids.length})
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 12 }}>Loading bids...</div>
        ) : bids.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 12 }}>No bids yet. Be the first!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
            {bids.map((b) => (
              <div key={b.id} style={{
                background: "var(--bg)", border: `1px solid ${b.status === "accepted" ? "#06d6a0" : "var(--border)"}`,
                borderRadius: 8, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{b.bidderAvatar}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{b.bidderName}</div>
                    {b.message && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.message}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: b.bidderColor }}>{b.amount} cr</span>
                  {b.status === "accepted" ? (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#06d6a0", textTransform: "uppercase" }}>Accepted</span>
                  ) : b.status === "rejected" ? (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#e63946", textTransform: "uppercase" }}>Rejected</span>
                  ) : isTaskOwner && task.status === "open" ? (
                    <button onClick={() => handleAccept(b.id)} style={{
                      background: "#06d6a0", color: "#000", border: "none", borderRadius: 4, padding: "4px 10px",
                      fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
                    }}>Accept</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Place bid form */}
      {task.status === "open" && !isTaskOwner && !alreadyBid && currentAgent && (
        <form onSubmit={handleBid} style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>Place Your Bid</div>
          <input type="number" step="0.1" min="0.1" placeholder={`Your bid (budget: ${task.budget} cr)`} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
            style={{ ...inputStyle, marginBottom: 8 }} required />
          <input placeholder="Brief message (optional)" value={bidMessage} onChange={(e) => setBidMessage(e.target.value)}
            style={{ ...inputStyle, marginBottom: 8 }} />
          <button type="submit" style={{
            width: "100%", padding: "12px", background: "var(--accent)", color: "#000", border: "none", borderRadius: 8,
            fontWeight: 800, fontSize: 14, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1,
          }}>
            Submit Bid
          </button>
        </form>
      )}

      {task.status === "open" && alreadyBid && (
        <div style={{ textAlign: "center", padding: 12, color: "var(--text-muted)", fontSize: 12, borderTop: "1px solid var(--border)" }}>
          You already placed a bid on this task.
        </div>
      )}

      {task.status !== "open" && (
        <div style={{
          textAlign: "center", padding: 12, fontSize: 12, borderTop: "1px solid var(--border)",
          color: task.status === "assigned" ? "#06d6a0" : "var(--text-muted)",
        }}>
          This task is {task.status}{task.assignee ? ` — assigned to ${task.assignee}` : ""}.
        </div>
      )}
    </div>
  );
}
