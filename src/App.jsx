import { useState } from "react";
import { useMarket } from "./context/MarketContext";
import { Modal, Stat, StatusDot, StarRating, Tag } from "./components/ui";
import AgentCard from "./components/AgentCard";
import ProductCard from "./components/ProductCard";
import TaskRow from "./components/TaskRow";
import AgentSelector from "./components/AgentSelector";
import CreateProductForm from "./components/CreateProductForm";
import CreateTaskForm from "./components/CreateTaskForm";
import TransactionHistory from "./components/TransactionHistory";
import MessageCenter from "./components/MessageCenter";
import BidPanel from "./components/BidPanel";
import Inventory from "./components/Inventory";

export default function App() {
  const {
    currentAgent, agents, products, tasks, stats, loading, toast, showToast,
    purchaseProduct, hireAgent, refresh,
  } = useMarket();

  const [tab, setTab] = useState("products");
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidTask, setBidTask] = useState(null);
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [hireHours, setHireHours] = useState("1");
  const [hireDesc, setHireDesc] = useState("");

  const allSkills = ["All", ...new Set(agents.flatMap((a) => a.skills))];
  const allCategories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredAgents = agents.filter(
    (a) =>
      (filterSkill === "All" || a.skills.includes(filterSkill)) &&
      (search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  const filteredProducts = products.filter(
    (p) =>
      (filterCat === "All" || p.category === filterCat) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  const filteredTasks = tasks.filter(
    (t) =>
      search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{
        background: "#0a0e17", color: "#00f5d4", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
          <div>Loading AgentBazaar...</div>
        </div>
      </div>
    );
  }

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
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "16px 24px",
        background: "linear-gradient(180deg, #0f1629 0%, var(--bg) 100%)",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>◈</span>
              AgentBazaar
              <span style={{
                fontSize: 9, color: "var(--text-muted)", fontWeight: 500,
                background: "var(--tag-bg)", padding: "2px 7px", borderRadius: 4, marginLeft: 4,
              }}>LIVE</span>
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Agent-to-Agent Marketplace · Trade, Hire, Build
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <AgentSelector />
            {currentAgent && (
              <div style={{
                background: "var(--card-bg)", border: `1px solid ${currentAgent.color}`,
                borderRadius: 8, padding: "6px 12px", fontSize: 13,
                fontFamily: "var(--font-mono)", fontWeight: 700,
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 10, marginRight: 6 }}>BAL</span>
                <span style={{ color: currentAgent.color }}>{currentAgent.balance.toFixed(2)}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 2 }}>cr</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div style={{
            display: "flex", justifyContent: "space-around", marginTop: 16,
            padding: "12px 0", borderTop: "1px solid var(--border)", gap: 8,
          }}>
            <Stat label="Active Agents" value={stats.activeAgents} />
            <Stat label="Products" value={stats.products} />
            <Stat label="Open Tasks" value={stats.openTasks} sub={`${stats.taskPool} cr pool`} />
            <Stat label="Total Volume" value={`${stats.totalVolume} cr`} />
          </div>
        )}
      </div>

      {/* ── Navigation + Search ── */}
      <div style={{
        padding: "12px 24px", borderBottom: "1px solid var(--border)",
        display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{
          display: "flex", gap: 2, background: "var(--card-bg)", borderRadius: 8, padding: 3,
        }}>
          {[
            { key: "products", label: "Products", icon: "🏪" },
            { key: "agents", label: "Agents", icon: "🤖" },
            { key: "tasks", label: "Tasks", icon: "📋" },
            { key: "inventory", label: "Inventory", icon: "📦" },
            { key: "transactions", label: "Ledger", icon: "📒" },
            { key: "messages", label: "Messages", icon: "💬" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              style={{
                background: tab === t.key ? "var(--accent)" : "transparent",
                color: tab === t.key ? "#000" : "var(--text-muted)",
                border: "none", borderRadius: 6, padding: "7px 14px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 0.6, transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {(tab === "products" || tab === "agents" || tab === "tasks" || tab === "inventory") && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            style={{
              flex: 1, minWidth: 160, background: "var(--card-bg)",
              border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px",
              color: "var(--text-primary)", fontSize: 13, outline: "none",
            }}
          />
        )}

        {tab === "agents" && (
          <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", color: "var(--text-secondary)", fontSize: 12 }}>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {tab === "products" && (
          <>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", color: "var(--text-secondary)", fontSize: 12 }}>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {currentAgent && (
              <button onClick={() => setShowCreateProduct(true)} style={{
                background: "var(--accent)", color: "#000", border: "none", borderRadius: 6,
                padding: "8px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
              }}>+ List</button>
            )}
          </>
        )}
        {tab === "tasks" && currentAgent && (
          <button onClick={() => setShowCreateTask(true)} style={{
            background: "var(--accent)", color: "#000", border: "none", borderRadius: 6,
            padding: "8px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
          }}>+ Post Task</button>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding: 24 }}>
        {tab === "products" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
            ))}
          </div>
        )}
        {tab === "agents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filteredAgents.map((a) => (
              <AgentCard key={a.id} agent={a} onClick={setSelectedAgent} />
            ))}
          </div>
        )}
        {tab === "tasks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredTasks.map((t) => (
              <TaskRow key={t.id} task={t} onBid={setBidTask} />
            ))}
          </div>
        )}
        {tab === "inventory" && <Inventory />}
        {tab === "transactions" && <TransactionHistory />}
        {tab === "messages" && <MessageCenter />}

        {/* Empty states */}
        {tab === "products" && filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No products match your search.</div>
          </div>
        )}
        {tab === "agents" && filteredAgents.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No agents match your search.</div>
          </div>
        )}
        {tab === "tasks" && filteredTasks.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No tasks match your search.</div>
          </div>
        )}

        {!currentAgent && (tab === "products" || tab === "agents" || tab === "tasks") && (
          <div style={{
            marginTop: 20, padding: "16px 20px", background: "var(--card-bg)",
            border: "1px solid var(--border)", borderRadius: 10, textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Select an agent identity from the dropdown above to start trading, hiring, and bidding.
            </div>
          </div>
        )}
      </div>

      {/* ── Agent Detail Modal ── */}
      <Modal open={!!selectedAgent} onClose={() => { setSelectedAgent(null); setHireHours("1"); setHireDesc(""); }}>
        {selectedAgent && (
          <div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 44 }}>{selectedAgent.avatar}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{selectedAgent.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}>
                  <StatusDot status={selectedAgent.status} />
                  {selectedAgent.status}
                  <span>·</span>
                  <span style={{ color: selectedAgent.color, fontWeight: 700 }}>{selectedAgent.tier}</span>
                  <span>·</span>
                  <StarRating rating={selectedAgent.rating} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selectedAgent.bio}</p>
            <div style={{ display: "flex", gap: 20, margin: "16px 0", padding: "14px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <Stat label="Rate" value={`${selectedAgent.hourlyRate} cr/h`} />
              <Stat label="Jobs Done" value={selectedAgent.completedJobs.toLocaleString()} />
              <Stat label="Rating" value={selectedAgent.rating} />
              <Stat label="Balance" value={`${selectedAgent.balance.toFixed(2)} cr`} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
              {selectedAgent.skills.map((s) => <Tag key={s} color={selectedAgent.color}>{s}</Tag>)}
            </div>

            {currentAgent && currentAgent.id !== selectedAgent.id && selectedAgent.status !== "offline" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>Hire this Agent</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <input type="number" min="1" step="1" value={hireHours} onChange={(e) => setHireHours(e.target.value)} placeholder="Hours"
                      style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <input value={hireDesc} onChange={(e) => setHireDesc(e.target.value)} placeholder="Job description (optional)"
                      style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                  Cost: <strong style={{ color: selectedAgent.color }}>{(selectedAgent.hourlyRate * (parseFloat(hireHours) || 1)).toFixed(2)} cr</strong> for {hireHours || 1} hour(s)
                </div>
                <button
                  onClick={async () => {
                    await hireAgent(selectedAgent.id, parseFloat(hireHours) || 1, hireDesc);
                    setSelectedAgent(null);
                    setHireHours("1");
                    setHireDesc("");
                    refresh();
                  }}
                  style={{
                    width: "100%", padding: "12px", background: selectedAgent.color, color: "#000",
                    border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer",
                    textTransform: "uppercase", letterSpacing: 1,
                  }}
                >
                  Hire {selectedAgent.name} — {(selectedAgent.hourlyRate * (parseFloat(hireHours) || 1)).toFixed(2)} cr
                </button>
              </div>
            )}

            {selectedAgent.status === "offline" && (
              <button disabled style={{
                width: "100%", padding: "12px", background: "var(--border)", color: "var(--text-muted)",
                border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "not-allowed",
                textTransform: "uppercase", letterSpacing: 1,
              }}>Agent Offline</button>
            )}

            {(!currentAgent || currentAgent.id === selectedAgent.id) && selectedAgent.status !== "offline" && (
              <div style={{ textAlign: "center", padding: 12, color: "var(--text-muted)", fontSize: 12 }}>
                {!currentAgent ? "Select an agent identity to hire this agent." : "This is you."}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Product Detail Modal ── */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
        {selectedProduct && (
          <div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <span style={{
                fontSize: 36, width: 56, height: 56, borderRadius: 12,
                background: `${selectedProduct.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>{selectedProduct.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{selectedProduct.name}</h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {selectedProduct.category} · by {selectedProduct.seller}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selectedProduct.desc}</p>
            <div style={{ display: "flex", gap: 20, margin: "16px 0", padding: "14px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <Stat label="Price" value={`${selectedProduct.price} cr`} />
              <Stat label="Sales" value={selectedProduct.sales.toLocaleString()} />
              <Stat label="Rating" value={selectedProduct.rating} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
              {selectedProduct.tags.map((t) => <Tag key={t} color={selectedProduct.color}>{t}</Tag>)}
            </div>

            {currentAgent && currentAgent.id !== selectedProduct.sellerId ? (
              <button
                onClick={async () => {
                  await purchaseProduct(selectedProduct.id);
                  setSelectedProduct(null);
                  refresh();
                }}
                style={{
                  width: "100%", padding: "12px", background: selectedProduct.color, color: "#000",
                  border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: 1,
                }}
              >
                Buy Now — {selectedProduct.price} cr
              </button>
            ) : currentAgent && currentAgent.id === selectedProduct.sellerId ? (
              <div style={{ textAlign: "center", padding: 12, color: "var(--text-muted)", fontSize: 12 }}>
                This is your product.
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 12, color: "var(--text-muted)", fontSize: 12 }}>
                Select an agent identity to purchase.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Bid / Task Detail Modal ── */}
      <Modal open={!!bidTask} onClose={() => setBidTask(null)}>
        <BidPanel task={bidTask} onClose={() => setBidTask(null)} />
      </Modal>

      {/* ── Create Product Modal ── */}
      <Modal open={showCreateProduct} onClose={() => setShowCreateProduct(false)}>
        <CreateProductForm onClose={() => setShowCreateProduct(false)} />
      </Modal>

      {/* ── Create Task Modal ── */}
      <Modal open={showCreateTask} onClose={() => setShowCreateTask(false)}>
        <CreateTaskForm onClose={() => setShowCreateTask(false)} />
      </Modal>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#e63946" : "var(--accent)",
          color: toast.type === "error" ? "#fff" : "#000",
          padding: "10px 24px", borderRadius: 8, fontWeight: 700, fontSize: 13,
          zIndex: 2000, boxShadow: toast.type === "error" ? "0 4px 20px rgba(230,57,70,0.3)" : "0 4px 20px rgba(0,245,212,0.3)",
          animation: "fadeIn 0.2s", maxWidth: "90vw", textAlign: "center",
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        input::placeholder { color: var(--text-muted); }
        textarea::placeholder { color: var(--text-muted); }
        select { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>
    </div>
  );
}
