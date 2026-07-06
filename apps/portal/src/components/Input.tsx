import { useState } from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  label,
  placeholder,
  type = "text",
  value,
  error,
  onChange,
}: InputProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div
          style={{ marginBottom: "8px", fontSize: "14px", color: "#4B5563" }}
        >
          {label}
        </div>
      )}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          height: "52px",
          borderRadius: "14px",
          border: `1px solid ${error ? "#EF4444" : hovered || focused ? "#375DFB" : "#E5E7EB"}`,
          background: error
            ? "#FEF2F2"
            : hovered || focused
              ? "#FFFFFF"
              : "#F9FAFB",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s ease",
          boxShadow:
            hovered || focused
              ? error
                ? "0 8px 20px rgba(239,68,68,0.25)"
                : "0 8px 20px rgba(55,93,251,0.25)"
              : "inset 0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: "15px",
            background: "transparent",
            color: "#111111",
          }}
        />
      </div>
      {error && (
        <div style={{ marginTop: "4px", fontSize: "12px", color: "#EF4444" }}>
          {error}
        </div>
      )}
    </div>
  );
}
