import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  onClick,
}: ButtonProps) {
  const variants = {
    primary: {
      background: "linear-gradient(135deg, #375DFB, #4A6FE0)",
      color: "#FFFFFF",
      border: "none",
    },
    secondary: {
      background: "#F3F4F6",
      color: "#374151",
      border: "1px solid #E5E7EB",
    },
    outline: {
      background: "transparent",
      color: "#375DFB",
      border: "1px solid #375DFB",
    },
  };

  const sizes = {
    small: { padding: "4px 12px", fontSize: "12px" },
    medium: { padding: "8px 16px", fontSize: "14px" },
    large: { padding: "12px 24px", fontSize: "16px" },
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "scale(1.02)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}
