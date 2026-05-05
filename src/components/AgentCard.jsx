import { StatusDot, Tag } from "./ui";

export default function AgentCard({ agent, onClick }) {
  return (
    <div
      onClick={() => onClick(agent)}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 18,
        cursor: "pointer",
        transition: "all 0.2s",
        borderLeft: `3px solid ${agent.color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = agent.color;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${agent.color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.borderLeftColor = agent.color;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{agent.avatar}</span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              {agent.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <StatusDot status={agent.status} />
              {agent.status} · {agent.tier}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: agent.color,
              fontFamily: "var(--font-mono)",
            }}
          >
            {agent.hourlyRate} cr/h
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          margin: "8px 0",
          lineHeight: 1.5,
        }}
      >
        {agent.bio}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 8 }}>
        {agent.skills.map((s) => (
          <Tag key={s} color={agent.color}>
            {s}
          </Tag>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <span>⭐ {agent.rating}</span>
        <span>{agent.completedJobs.toLocaleString()} jobs</span>
      </div>
    </div>
  );
}
