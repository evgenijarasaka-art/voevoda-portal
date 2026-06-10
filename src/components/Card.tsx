import { useState } from "react";

interface CardProps {
  title?: string;
  city?: string;
  duration?: string;
  price?: number;
  oldPrice?: number;
  name?: string;
  rank?: string;
  position?: string;
  index?: number;
  image: string;
}

export function Card(props: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0)",
        boxShadow: hovered
          ? "0 25px 40px rgba(55,93,251,0.25)"
          : "0 4px 6px rgba(0,0,0,0.03)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          height: "180px",
          background: "linear-gradient(160deg, #78716C, #44403C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "52px",
          color: "#FFFFFF",
        }}
      >
        {props.image}
      </div>
      <div style={{ padding: "16px" }}>
        {props.title ? (
          // Course card
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#9CA3AF",
              }}
            >
              <span>{props.city}</span>
              <span>{props.duration}</span>
            </div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "8px 0",
                color: "#111111",
              }}
            >
              {props.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{ fontSize: "20px", fontWeight: 700, color: "#059669" }}
              >
                {props.price?.toLocaleString()} ₽
              </span>
              {props.oldPrice && (
                <span
                  style={{
                    fontSize: "14px",
                    color: "#9CA3AF",
                    textDecoration: "line-through",
                  }}
                >
                  {props.oldPrice.toLocaleString()} ₽
                </span>
              )}
            </div>
          </>
        ) : (
          // Teacher card
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#374151",
                  background: "#F3F4F6",
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {props.rank}
              </span>
              <span
                style={{ fontSize: "14px", fontWeight: 600, color: "#375DFB" }}
              >
                Индекс {props.index}
              </span>
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 4px",
                color: "#111111",
              }}
            >
              {props.name}
            </h3>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
              {props.position}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
