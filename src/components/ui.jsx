export const StatusDot = ({ status }) => {
  const colors = { online: "#00f5d4", busy: "#ffbe0b", offline: "#666" };
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colors[status],
        boxShadow:
          status === "online" ? `0 0 6px ${colors[status]}` : "none",
        marginRight: 6,
      }}
    />
  );
};

export const StarRating = ({ rating }) => (
  <span style={{ color: "#ffbe0b", fontSize: 12, letterSpacing: 1 }}>
    {"★".repeat(Math.floor(rating))}
    {rating % 1 >= 0.5 ? "½" : ""}
    <span
      style={{ color: "var(--text-muted)", marginLeft: 4, fontSize: 11 }}
    >
      {rating}
    </span>
  </span>
);

export const Tag = ({ children, color }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 3,
      background: color ? `${color}18` : "var(--tag-bg)",
      color: color || "var(--text-secondary)",
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginRight: 4,
      marginBottom: 4,
    }}
  >
    {children}
  </span>
);

export const Stat = ({ label, value, sub }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: 22,
        fontWeight: 800,
        color: "var(--text-primary)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: 10,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 2,
      }}
    >
      {label}
    </div>
    {sub && (
      <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 1 }}>
        {sub}
      </div>
    )}
  </div>
);

export const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          maxWidth: 520,
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          padding: 28,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
