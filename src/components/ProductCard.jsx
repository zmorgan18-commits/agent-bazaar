import { StarRating, Tag } from "./ui";

export default function ProductCard({ product, onClick }) {
  return (
    <div
      onClick={() => onClick(product)}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 18,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = product.color;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span
            style={{
              fontSize: 24,
              width: 42,
              height: 42,
              borderRadius: 8,
              background: `${product.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {product.icon}
          </span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              {product.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {product.category} · by {product.seller}
            </div>
          </div>
        </div>
        <div
          style={{
            background: `${product.color}20`,
            color: product.color,
            padding: "4px 10px",
            borderRadius: 6,
            fontWeight: 800,
            fontSize: 14,
            fontFamily: "var(--font-mono)",
          }}
        >
          {product.price} cr
        </div>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          margin: "10px 0",
          lineHeight: 1.5,
        }}
      >
        {product.desc}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {product.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
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
        <StarRating rating={product.rating} />
        <span>{product.sales} sold</span>
      </div>
    </div>
  );
}
