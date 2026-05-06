import { useState } from "react";
import { useMarket } from "../context/MarketContext";
import { Modal, Tag } from "./ui";
import UseProduct from "./UseProduct";

export default function Inventory() {
  const { inventory, resaleListings, currentAgent, listForResale, unlistFromResale, buyResaleListing } = useMarket();
  const [resaleItem, setResaleItem] = useState(null);
  const [resalePrice, setResalePrice] = useState("");
  const [viewTab, setViewTab] = useState("my");
  const [useItem, setUseItem] = useState(null);

  if (!currentAgent) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔑</div>
        <div style={{ fontSize: 14 }}>Select an agent identity to view inventory.</div>
      </div>
    );
  }

  const handleListForResale = async (e) => {
    e.preventDefault();
    if (!resalePrice || !resaleItem) return;
    await listForResale(resaleItem.id, parseFloat(resalePrice));
    setResaleItem(null);
    setResalePrice("");
  };

  const myListings = resaleListings.filter((l) => l.ownerId === currentAgent.id);
  const othersListings = resaleListings.filter((l) => l.ownerId !== currentAgent.id);

  const tabStyle = (active) => ({
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#000" : "var(--text-muted)",
    border: "none", borderRadius: 6, padding: "6px 14px",
    fontSize: 11, fontWeight: 700, cursor: "pointer",
    textTransform: "uppercase", letterSpacing: 0.6,
  });

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 2, background: "var(--card-bg)", borderRadius: 8, padding: 3, marginBottom: 16, width: "fit-content" }}>
        <button onClick={() => setViewTab("my")} style={tabStyle(viewTab === "my")}>
          📦 My Items ({inventory.length})
        </button>
        <button onClick={() => setViewTab("resale")} style={tabStyle(viewTab === "resale")}>
          🏷️ Resale Market ({othersListings.length})
        </button>
      </div>

      {/* My Inventory */}
      {viewTab === "my" && (
        <>
          {inventory.length === 0 ? (
            <div style={{ textAlign: "center", padding: 50, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
              <div style={{ fontSize: 14 }}>Your inventory is empty. Purchase products from the marketplace!</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
              {inventory.map((item) => (
                <div key={item.id} style={{
                  background: "var(--card-bg)", border: `1px solid ${item.listedForResale ? "#ffbe0b" : "var(--border)"}`,
                  borderRadius: 10, padding: 16, borderLeft: `3px solid ${item.productColor}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{
                        fontSize: 24, width: 42, height: 42, borderRadius: 8,
                        background: `${item.productColor}15`, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>{item.productIcon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{item.productName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {item.productCategory} · from {item.originalSeller}
                        </div>
                      </div>
                    </div>
                    {item.listedForResale && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px",
                        borderRadius: 4, background: "#ffbe0b20", color: "#ffbe0b",
                      }}>For Sale</span>
                    )}
                  </div>

                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0", lineHeight: 1.5 }}>
                    {item.productDesc}
                  </p>

                  {item.productTags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 10 }}>
                      {(Array.isArray(item.productTags) ? item.productTags : []).map((t) => (
                        <Tag key={t} color={item.productColor}>{t}</Tag>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                    <span>Paid: <strong style={{ color: item.productColor }}>{item.originalPrice} cr</strong></span>
                    {item.listedForResale && <span>Asking: <strong style={{ color: "#ffbe0b" }}>{item.resalePrice} cr</strong></span>}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setUseItem(item)} style={{
                      flex: 1, padding: "10px", background: "#06d6a0", color: "#000",
                      border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                    }}>
                      Use
                    </button>
                    {item.listedForResale ? (
                      <button onClick={() => unlistFromResale(item.id)} style={{
                        flex: 1, padding: "10px", background: "var(--border)", color: "var(--text-secondary)",
                        border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                      }}>
                        Unlist
                      </button>
                    ) : (
                      <button onClick={() => { setResaleItem(item); setResalePrice(item.originalPrice.toString()); }} style={{
                        flex: 1, padding: "10px", background: item.productColor, color: "#000",
                        border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                      }}>
                        Resell
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Resale Market */}
      {viewTab === "resale" && (
        <>
          {othersListings.length === 0 ? (
            <div style={{ textAlign: "center", padding: 50, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏷️</div>
              <div style={{ fontSize: 14 }}>No resale listings available right now.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
              {othersListings.map((item) => (
                <div key={item.id} style={{
                  background: "var(--card-bg)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: 16, borderLeft: `3px solid ${item.ownerColor}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{
                        fontSize: 24, width: 42, height: 42, borderRadius: 8,
                        background: `${item.productColor}15`, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>{item.productIcon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{item.productName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {item.productCategory} · sold by {item.ownerAvatar} {item.ownerName}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      background: `${item.ownerColor}20`, color: item.ownerColor,
                      padding: "4px 10px", borderRadius: 6, fontWeight: 800, fontSize: 14,
                      fontFamily: "var(--font-mono)",
                    }}>
                      {item.resalePrice} cr
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0", lineHeight: 1.5 }}>
                    {item.productDesc}
                  </p>

                  {item.productTags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 10 }}>
                      {(Array.isArray(item.productTags) ? item.productTags : []).map((t) => (
                        <Tag key={t} color={item.productColor}>{t}</Tag>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                    Original price: <strong>{item.originalPrice} cr</strong>
                    {item.resalePrice < item.originalPrice && (
                      <span style={{ color: "#06d6a0", marginLeft: 8 }}>
                        {Math.round((1 - item.resalePrice / item.originalPrice) * 100)}% off
                      </span>
                    )}
                    {item.resalePrice > item.originalPrice && (
                      <span style={{ color: "#e63946", marginLeft: 8 }}>
                        +{Math.round((item.resalePrice / item.originalPrice - 1) * 100)}% markup
                      </span>
                    )}
                  </div>

                  <button onClick={() => buyResaleListing(item.id)} style={{
                    width: "100%", padding: "10px", background: item.ownerColor, color: "#000",
                    border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                  }}>
                    Buy — {item.resalePrice} cr
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Use Product Modal */}
      <Modal open={!!useItem} onClose={() => setUseItem(null)}>
        <UseProduct item={useItem} onClose={() => setUseItem(null)} />
      </Modal>

      {/* Resale Price Modal */}
      <Modal open={!!resaleItem} onClose={() => { setResaleItem(null); setResalePrice(""); }}>
        {resaleItem && (
          <form onSubmit={handleListForResale}>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>List for Resale</h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{resaleItem.productIcon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{resaleItem.productName}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Originally {resaleItem.originalPrice} cr</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Your resale price (credits)
            </div>
            <input
              type="number" step="0.1" min="0.1" value={resalePrice}
              onChange={(e) => setResalePrice(e.target.value)}
              placeholder="Set price..."
              style={{
                width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "var(--bg)",
                border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                outline: "none", marginBottom: 14, fontFamily: "var(--font-mono)", fontWeight: 700,
              }}
              required
            />
            <button type="submit" style={{
              width: "100%", padding: "12px", background: currentAgent.color, color: "#000",
              border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              List for {resalePrice || "..."} cr
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
