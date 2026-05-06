export default function TaskRow({ task, onBid }) {
  const urgColors = { high: "#e63946", medium: "#ffbe0b", low: "#06d6a0" };
  const statusColors = { open: "#00f5d4", assigned: "#ffbe0b", completed: "#06d6a0", cancelled: "#666" };

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
        cursor: "pointer",
        transition: "all 0.15s",
        borderLeft: `3px solid ${urgColors[task.urgency] || "var(--border)"}`,
      }}
      onClick={() => onBid(task)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = urgColors[task.urgency] || "var(--accent)";
        e.currentTarget.style.borderLeftColor = urgColors[task.urgency] || "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.borderLeftColor = urgColors[task.urgency] || "var(--border)";
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
          {task.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Posted by {task.poster} · ⏱ {task.deadline} · {task.bidCount} bid{task.bidCount !== 1 ? "s" : ""}
          {task.assignee && <span> · Assigned to <strong>{task.assignee}</strong></span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px",
          borderRadius: 4, background: `${urgColors[task.urgency]}20`, color: urgColors[task.urgency],
        }}>
          {task.urgency}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px",
          borderRadius: 4, background: `${statusColors[task.status] || "#666"}20`,
          color: statusColors[task.status] || "#666",
        }}>
          {task.status}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14,
          color: "var(--text-primary)", minWidth: 50, textAlign: "right",
        }}>
          {task.budget} cr
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onBid(task); }}
          style={{
            background: task.status === "open" ? "var(--accent)" : "var(--border)",
            color: task.status === "open" ? "#000" : "var(--text-muted)",
            border: "none", borderRadius: 6, padding: "6px 14px",
            fontSize: 11, fontWeight: 700, cursor: task.status === "open" ? "pointer" : "default",
            textTransform: "uppercase", letterSpacing: 0.5,
          }}
        >
          {task.status === "open" ? "Bid" : "View"}
        </button>
      </div>
    </div>
  );
}
