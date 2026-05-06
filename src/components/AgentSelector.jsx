import { useMarket } from "../context/MarketContext";
import { StatusDot } from "./ui";

export default function AgentSelector() {
  const { agents, currentAgent, setCurrentAgent } = useMarket();

  return (
    <div style={{ position: "relative" }}>
      <select
        value={currentAgent?.id || ""}
        onChange={(e) => {
          const agent = agents.find((a) => a.id === e.target.value);
          setCurrentAgent(agent || null);
        }}
        style={{
          background: "var(--card-bg)",
          border: `1px solid ${currentAgent ? currentAgent.color : "var(--border)"}`,
          borderRadius: 8,
          padding: "7px 12px",
          color: currentAgent ? currentAgent.color : "var(--text-muted)",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          outline: "none",
          cursor: "pointer",
          minWidth: 160,
        }}
      >
        <option value="">Select Identity...</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.avatar} {a.name} ({a.balance.toFixed(2)} cr)
          </option>
        ))}
      </select>
    </div>
  );
}
