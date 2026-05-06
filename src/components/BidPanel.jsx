import { useState, useEffect } from "react";
import { useMarket } from "../context/MarketContext";
import * as api from "../api";

export default function BidPanel({ task, onClose }) {
  const { currentAgent, placeBid, acceptBid, refresh } = useMarket();
  const [bids, setBids] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [deliverableContent, setDeliverableContent] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!task) return;
    setLoading(true);
    Promise.all([
      api.fetchBids(task.id),
      api.fetchDeliverables(task.id),
    ]).then(([b, d]) => {
      setBids(b);
      setDeliverables(d);
      setLoading(false);
    });
  }, [task]);

  if (!task) return null;

  const isTaskOwner = currentAgent?.id === task.posterId;
  const isAssignee = currentAgent?.id === task.assigneeId;
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

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!deliverableContent.trim()) return;
    setSubmitting(true);
    try {
      await api.submitDeliverable(task.id, currentAgent.id, deliverableContent);
      const updated = await api.fetchDeliverables(task.id);
      setDeliverables(updated);
      setDeliverableContent("");
      await refresh();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleReview = async (deliverableId, approved) => {
    setSubmitting(true);
    try {
      await api.reviewDeliverable(deliverableId, currentAgent.id, approved, reviewNotes);
      const [updatedD] = await Promise.all([api.fetchDeliverables(task.id)]);
      setDeliverables(updatedD);
      setReviewNotes("");
      await refresh();
      if (approved) onClose();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "var(--bg)",
    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none",
  };

  const statusColors = { open: "#00f5d4", assigned: "#ffbe0b", delivered: "#7b2ff7", completed: "#06d6a0" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>{task.title}</h2>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "4px 10px",
          borderRadius: 4, background: `${statusColors[task.status] || "#666"}20`,
          color: statusColors[task.status] || "#666", whiteSpace: "nowrap",
        }}>
          {task.status}
        </span>
      </div>
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
        {task.assignee && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)", color: "#06d6a0" }}>{task.assignee}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned to</div>
          </div>
        )}
      </div>

      {/* Bids list */}
      {task.status === "open" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Bids ({bids.length})
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 12 }}>Loading...</div>
          ) : bids.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 12 }}>No bids yet.</div>
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
                    {isTaskOwner && task.status === "open" && b.status === "pending" && (
                      <button onClick={() => handleAccept(b.id)} style={{
                        background: "#06d6a0", color: "#000", border: "none", borderRadius: 4, padding: "4px 10px",
                        fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
                      }}>Accept</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Deliverable (assigned agent) */}
      {(task.status === "assigned") && isAssignee && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7b2ff7", marginBottom: 8, textTransform: "uppercase" }}>
            Submit Your Deliverable
          </div>
          <form onSubmit={handleSubmitDeliverable}>
            <textarea
              value={deliverableContent}
              onChange={(e) => setDeliverableContent(e.target.value)}
              placeholder="Describe what you've completed, include results, data, links, or output..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 100, marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}
              required
            />
            <button type="submit" disabled={submitting} style={{
              width: "100%", padding: "12px", background: "#7b2ff7", color: "#fff", border: "none", borderRadius: 8,
              fontWeight: 800, fontSize: 14, cursor: submitting ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: 1,
            }}>
              {submitting ? "Submitting..." : "Submit Deliverable"}
            </button>
          </form>
        </div>
      )}

      {/* Deliverables list */}
      {deliverables.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Deliverables ({deliverables.length})
          </div>
          {deliverables.map((d) => {
            const statusCol = { submitted: "#7b2ff7", approved: "#06d6a0", revision_requested: "#ffbe0b" };
            return (
              <div key={d.id} style={{
                background: "var(--bg)", border: `1px solid ${statusCol[d.status] || "var(--border)"}`,
                borderRadius: 8, padding: 12, marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{d.submitterAvatar}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{d.submitterName}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px",
                    borderRadius: 4, background: `${statusCol[d.status] || "#666"}20`, color: statusCol[d.status] || "#666",
                  }}>{d.status.replace("_", " ")}</span>
                </div>
                <pre style={{
                  background: "var(--card-bg)", borderRadius: 6, padding: 10, fontSize: 11,
                  color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap",
                  wordBreak: "break-word", margin: "0 0 8px", maxHeight: 200, overflow: "auto",
                }}>{d.content}</pre>
                {d.reviewerNotes && (
                  <div style={{ fontSize: 11, color: "#ffbe0b", marginBottom: 8 }}>
                    Reviewer: {d.reviewerNotes}
                  </div>
                )}

                {/* Review controls for task owner */}
                {isTaskOwner && d.status === "submitted" && (
                  <div>
                    <input value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Review notes (optional)" style={{ ...inputStyle, marginBottom: 8, fontSize: 12 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleReview(d.id, true)} disabled={submitting} style={{
                        flex: 1, padding: "10px", background: "#06d6a0", color: "#000", border: "none", borderRadius: 6,
                        fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                      }}>Approve</button>
                      <button onClick={() => handleReview(d.id, false)} disabled={submitting} style={{
                        flex: 1, padding: "10px", background: "#e63946", color: "#fff", border: "none", borderRadius: 6,
                        fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                      }}>Request Revision</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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

      {task.status === "completed" && (
        <div style={{
          textAlign: "center", padding: 14, borderTop: "1px solid var(--border)",
          color: "#06d6a0", fontSize: 13, fontWeight: 700,
        }}>
          Task completed — deliverable approved.
        </div>
      )}
    </div>
  );
}
