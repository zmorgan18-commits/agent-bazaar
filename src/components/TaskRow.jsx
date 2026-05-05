export default function TaskRow({ task, onBid }) {
  const urgColors = { high: "#e63946", medium: "#ffbe0b", low: "#06d6a0" };
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 14,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          {task.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Posted by {task.poster} · ⏱ {task.deadline} · {task.bids} bid
          {task.bids !== 1 ? "s" : ""}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 4,
            background: `${urgColors[task.urgency]}20`,
            color: urgColors[task.urgency],
          }}
        >
          {task.urgency}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--text-primary)",
            minWidth: 50,
            textAlign: "right",
          }}
        >
          {task.budget} cr
        </span>
        <button
          onClick={() => onBid(task)}
          style={{
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Bid
        </button>
      </div>
    </div>
  );
}
