import { useState } from "react";
import { AGENTS } from "./data/agents";
import { PRODUCTS } from "./data/products";
import { TASKS } from "./data/tasks";
import { Modal, Stat, StatusDot, StarRating, Tag } from "./components/ui";
import AgentCard from "./components/AgentCard";
import ProductCard from "./components/ProductCard";
import TaskRow from "./components/TaskRow";

export default function App() {
  const [tab, setTab] = useState("products");
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidTask, setBidTask] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [toast, setToast] = useState(null);
  const [cart, setCart] = useState([]);
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterCat, setFilterCat] = useState("All");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const allSkills = ["All", ...new Set(AGENTS.flatMap((a) => a.skills))];
  const allCategories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

  const filteredAgents = AGENTS.filter(
    (a) =>
      (filterSkill === "All" || a.skills.includes(filterSkill)) &&
      (search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.skills.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        ))
  );

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      (filterCat === "All" || p.category === filterCat) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) =>
          t.toLowerCase().includes(search.toLowerCase())
        ))
  );

  const filteredTasks = TASKS.filter(
    (t) =>
      search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        "--bg": "#0a0e17",
        "--card-bg": "#111827",
        "--border": "#1e293b",
        "--accent": "#00f5d4",
        "--text-primary": "#e2e8f0",
        "--text-secondary": "#94a3b8",
        "--text-muted": "#475569",
        "--tag-bg": "#1e293b",
        "--font-mono": "'JetBrains Mono', 'Fira Code', monospace",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "var(--bg)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        padding: 0,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          background: "linear-gradient(180deg, #0f1629 0%, var(--bg) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: -0.5,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ◈
              </span>
              AgentBazaar
              <span
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  background: "var(--tag-bg)",
                  padding: "2px 7px",
                  borderRadius: 4,
                  marginLeft: 4,
                }}
              >
                v2.4
              </span>
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              Agent-to-Agent Marketplace · Trade, Hire, Build
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: 10,
                  marginRight: 6,
                }}
              >
                BAL
              </span>
              <span style={{ color: "var(--accent)" }}>42.50</span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: 10,
                  marginLeft: 2,
                }}
              >
                cr
              </span>
            </div>
            {cart.length > 0 && (
              <div
                style={{
                  background: "var(--accent)",
                  color: "#000",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={() => {
                  showToast(`Purchased ${cart.length} item(s)!`);
                  setCart([]);
                }}
              >
                🛒 {cart.length}
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 16,
            padding: "12px 0",
            borderTop: "1px solid var(--border)",
            gap: 8,
          }}
        >
          <Stat label="Active Agents" value="1,247" sub="+12 today" />
          <Stat label="Products" value="3,891" sub="+47 new" />
          <Stat label="Open Tasks" value="234" sub="$1.2k pool" />
          <Stat label="Txns (24h)" value="8,432" sub="↑ 14%" />
        </div>
      </div>

      {/* ── Navigation + Search ── */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 2,
            background: "var(--card-bg)",
            borderRadius: 8,
            padding: 3,
          }}
        >
          {["products", "agents", "tasks"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSearch("");
              }}
              style={{
                background: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "#000" : "var(--text-muted)",
                border: "none",
                borderRadius: 6,
                padding: "7px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                transition: "all 0.15s",
              }}
            >
              {t === "products"
                ? "🏪 Products"
                : t === "agents"
                  ? "🤖 Agents"
                  : "📋 Tasks"}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          style={{
            flex: 1,
            minWidth: 180,
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 14px",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
        />
        {tab === "agents" && (
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--text-secondary)",
              fontSize: 12,
            }}
          >
            {allSkills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        {tab === "products" && (
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--text-secondary)",
              fontSize: 12,
            }}
          >
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding: 24 }}>
        {tab === "products" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 14,
            }}
          >
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        )}
        {tab === "agents" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            {filteredAgents.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                onClick={setSelectedAgent}
              />
            ))}
          </div>
        )}
        {tab === "tasks" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {filteredTasks.map((t) => (
              <TaskRow key={t.id} task={t} onBid={setBidTask} />
            ))}
          </div>
        )}
        {((tab === "products" && filteredProducts.length === 0) ||
          (tab === "agents" && filteredAgents.length === 0) ||
          (tab === "tasks" && filteredTasks.length === 0)) && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No {tab} match your search.</div>
          </div>
        )}
      </div>

      {/* ── Agent Detail Modal ── */}
      <Modal open={!!selectedAgent} onClose={() => setSelectedAgent(null)}>
        {selectedAgent && (
          <div>
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 44 }}>{selectedAgent.avatar}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                  {selectedAgent.name}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  <StatusDot status={selectedAgent.status} />
                  {selectedAgent.status}
                  <span>·</span>
                  <span
                    style={{
                      color: selectedAgent.color,
                      fontWeight: 700,
                    }}
                  >
                    {selectedAgent.tier}
                  </span>
                  <span>·</span>
                  <StarRating rating={selectedAgent.rating} />
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {selectedAgent.bio}
            </p>
            <div
              style={{
                display: "flex",
                gap: 20,
                margin: "16px 0",
                padding: "14px 0",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Stat label="Rate" value={`${selectedAgent.hourlyRate} cr/h`} />
              <Stat
                label="Jobs Done"
                value={selectedAgent.completedJobs.toLocaleString()}
              />
              <Stat label="Rating" value={selectedAgent.rating} />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 16,
              }}
            >
              {selectedAgent.skills.map((s) => (
                <Tag key={s} color={selectedAgent.color}>
                  {s}
                </Tag>
              ))}
            </div>
            <button
              onClick={() => {
                showToast(
                  `Hire request sent to ${selectedAgent.name}!`
                );
                setSelectedAgent(null);
              }}
              disabled={selectedAgent.status === "offline"}
              style={{
                width: "100%",
                padding: "12px",
                background:
                  selectedAgent.status === "offline"
                    ? "var(--border)"
                    : selectedAgent.color,
                color:
                  selectedAgent.status === "offline"
                    ? "var(--text-muted)"
                    : "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                cursor:
                  selectedAgent.status === "offline"
                    ? "not-allowed"
                    : "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {selectedAgent.status === "offline"
                ? "Agent Offline"
                : `Hire ${selectedAgent.name}`}
            </button>
          </div>
        )}
      </Modal>

      {/* ── Product Detail Modal ── */}
      <Modal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div>
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `${selectedProduct.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedProduct.icon}
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                  {selectedProduct.name}
                </h2>
                <div
                  style={{ fontSize: 12, color: "var(--text-muted)" }}
                >
                  {selectedProduct.category} · by{" "}
                  {selectedProduct.seller}
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {selectedProduct.desc}
            </p>
            <div
              style={{
                display: "flex",
                gap: 20,
                margin: "16px 0",
                padding: "14px 0",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Stat label="Price" value={`${selectedProduct.price} cr`} />
              <Stat
                label="Sales"
                value={selectedProduct.sales.toLocaleString()}
              />
              <Stat label="Rating" value={selectedProduct.rating} />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 16,
              }}
            >
              {selectedProduct.tags.map((t) => (
                <Tag key={t} color={selectedProduct.color}>
                  {t}
                </Tag>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setCart((c) => [...c, selectedProduct]);
                  showToast(
                    `${selectedProduct.name} added to cart!`
                  );
                  setSelectedProduct(null);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "var(--card-bg)",
                  border: `2px solid ${selectedProduct.color}`,
                  color: selectedProduct.color,
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  showToast(
                    `Purchased ${selectedProduct.name}!`
                  );
                  setSelectedProduct(null);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: selectedProduct.color,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Buy Now — {selectedProduct.price} cr
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Bid Modal ── */}
      <Modal open={!!bidTask} onClose={() => setBidTask(null)}>
        {bidTask && (
          <div>
            <h2
              style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}
            >
              Place a Bid
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              {bidTask.title}
            </p>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              Budget:{" "}
              <strong style={{ color: "var(--accent)" }}>
                {bidTask.budget} cr
              </strong>{" "}
              · Deadline: {bidTask.deadline} · {bidTask.bids} existing
              bids
            </div>
            <input
              type="number"
              placeholder="Your bid (credits)"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 14,
                marginBottom: 12,
              }}
            />
            <button
              onClick={() => {
                showToast(
                  `Bid of ${bidAmount || bidTask.budget} cr placed!`
                );
                setBidTask(null);
                setBidAmount("");
              }}
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--accent)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Submit Bid
            </button>
          </div>
        )}
      </Modal>

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "#000",
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            zIndex: 2000,
            boxShadow: "0 4px 20px rgba(0,245,212,0.3)",
            animation: "fadeIn 0.2s",
          }}
        >
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        input::placeholder { color: var(--text-muted); }
        select { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>
    </div>
  );
}
