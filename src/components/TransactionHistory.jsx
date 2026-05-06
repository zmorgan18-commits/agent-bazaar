import { useMarket } from "../context/MarketContext";

const TYPE_LABELS = {
  product_purchase: "Purchase",
  hire: "Hire",
  task_completion: "Task",
  resale: "Resale",
};

const TYPE_ICONS = {
  product_purchase: "🏪",
  hire: "🤝",
  task_completion: "📋",
  resale: "🏷️",
};

export default function TransactionHistory() {
  const { transactions, currentAgent } = useMarket();

  if (!currentAgent) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔑</div>
        <div style={{ fontSize: 14 }}>Select an agent identity to view transactions.</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📜</div>
        <div style={{ fontSize: 14 }}>No transactions yet.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {transactions.map((tx) => {
        const isBuyer = tx.buyerId === currentAgent.id;
        return (
          <div key={tx.id} style={{
            background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 14,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 20 }}>{TYPE_ICONS[tx.type] || "💰"}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{tx.itemName}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {TYPE_LABELS[tx.type] || tx.type} · {isBuyer ? `→ ${tx.sellerName}` : `← ${tx.buyerName}`}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14,
                color: isBuyer ? "#e63946" : "#06d6a0",
              }}>
                {isBuyer ? "-" : "+"}{tx.amount.toFixed(2)} cr
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, textTransform: "uppercase", padding: "3px 8px",
                borderRadius: 4, background: tx.status === "completed" ? "#06d6a020" : "#ffbe0b20",
                color: tx.status === "completed" ? "#06d6a0" : "#ffbe0b",
              }}>
                {tx.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
