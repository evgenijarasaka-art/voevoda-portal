import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BIN_ID = "69b5cb06b7ec241ddc6b7154";
const API_KEY = "$2a$10$oAHbsHbjUAGAQ/qGKfWeDuiDEypdpm3R7luKjPeOwCtNqnT2n4ZwW";

export function Verify() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [boxHovered, setBoxHovered] = useState(false);
  const [resendHovered, setResendHovered] = useState(false);
  const [registerHovered, setRegisterHovered] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.get(
        `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
        {
          headers: { "X-Master-Key": API_KEY },
        },
      );

      const savedCode = res.data.record.verificationCode;
      const expires = res.data.record.expires;
      const inputCode = code.join("");

      if (Date.now() > expires) {
        alert("Код устарел, запросите новый");
        return;
      }

      if (inputCode === savedCode) {
        alert("Успешно!");
        navigate("/");
      } else {
        alert("Неверный код");
      }
    } catch (error) {
      console.error("Ошибка загрузки кода", error);
      alert("Ошибка проверки кода");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        background: "radial-gradient(circle at 30% 30%, #1F1F2A, #0A0A0F 80%)",
        overflow: "hidden",
      }}
    >
      {/* Анимированный фон */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 40%, rgba(55,93,251,0.08) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(55,93,251,0.08) 0%, transparent 30%)",
          zIndex: 0,
        }}
      />

      {/* Световые пятна */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(55,93,251,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "pulseGlow 4s infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(55,93,251,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulseGlow 5s infinite reverse",
          zIndex: 0,
        }}
      />

      {/* Фоновое фото */}
      <img
        src="/verify-bg.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: "brightness(0.4) blur(2px)",
          transform: "scale(1.1)",
          animation: "slowZoom 20s infinite alternate",
        }}
      />

      {/* Логотип с ссылкой на главную */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          style={{
            position: "absolute",
            top: "32px",
            left: "72px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "16px",
            background: logoHovered
              ? "rgba(255,255,255,0.2)"
              : "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            transition: "all 0.3s ease",
            transform: logoHovered ? "scale(1.05)" : "scale(1)",
            boxShadow: logoHovered ? "0 0 30px rgba(55,93,251,0.5)" : "none",
          }}
        >
          <img
            src="/logo.png"
            alt="УТЦ Воевода"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 10px rgba(55,93,251,0.5))",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "1px",
              textShadow:
                "0 0 10px rgba(55,93,251,0.5), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            УТЦ ВОЕВОДА
          </span>
        </div>
      </Link>

      {/* Блок верификации */}
      <div
        onMouseEnter={() => setBoxHovered(true)}
        onMouseLeave={() => setBoxHovered(false)}
        style={{
          position: "relative",
          zIndex: 1,
          width: "440px",
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(10px)",
          borderRadius: "32px",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          boxShadow: boxHovered
            ? "0 40px 80px rgba(55,93,251,0.5), 0 0 0 2px rgba(55,93,251,0.6), 0 0 30px #375DFB"
            : "0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          transform: boxHovered
            ? "translateY(-6px) scale(1.02)"
            : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
        }}
      >
        {/* Неоновая рамка */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "32px",
            border: "2px solid transparent",
            background:
              "linear-gradient(135deg, #375DFB, #6D8EFF, #375DFB) border-box",
            WebkitMask:
              "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: boxHovered ? 1 : 0.3,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* Заголовок */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "Inter Display, sans-serif",
              fontWeight: 600,
              fontSize: "28px",
              lineHeight: "36px",
              letterSpacing: "-0.5px",
              margin: "0 0 8px",
              color: "#111111",
              textShadow: boxHovered
                ? "0 2px 10px rgba(55,93,251,0.3)"
                : "none",
              transition: "text-shadow 0.3s ease",
            }}
          >
            Верификация
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "22px",
              letterSpacing: "-0.6%",
              color: "#4B5563",
              margin: 0,
            }}
          >
            Введите код из SMS
          </p>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              color: "#375DFB",
              margin: "4px 0 0",
            }}
          >
            +7 (999) 123-45-67
          </p>
        </div>

        {/* Поля для кода */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            margin: "0 auto",
          }}
        >
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(-1)}
              style={{
                width: "70px",
                height: "80px",
                borderRadius: "16px",
                border:
                  activeIndex === index
                    ? "2px solid #375DFB"
                    : "1px solid #E5E7EB",
                background: code[index] ? "#F9FAFB" : "#FFFFFF",
                fontSize: "32px",
                fontWeight: 600,
                textAlign: "center",
                color: "#111111",
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow:
                  activeIndex === index
                    ? "0 0 20px rgba(55,93,251,0.3)"
                    : "inset 0 2px 4px rgba(0,0,0,0.02)",
              }}
            />
          ))}
        </div>

        {/* Кнопка проверки */}
        <button
          onMouseEnter={() => setRegisterHovered(true)}
          onMouseLeave={() => setRegisterHovered(false)}
          onClick={handleVerify}
          style={{
            width: "100%",
            height: "56px",
            borderRadius: "16px",
            border: "none",
            background: registerHovered
              ? "linear-gradient(135deg, #1E3F9F, #2A4FB0)"
              : "linear-gradient(135deg, #375DFB, #4A6FE0)",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: registerHovered ? "scale(1.02)" : "scale(1)",
            boxShadow: registerHovered
              ? "0 15px 30px rgba(55,93,251,0.5), 0 0 0 2px rgba(255,255,255,0.2)"
              : "0 10px 20px rgba(55,93,251,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span style={{ position: "relative", zIndex: 2 }}>Подтвердить</span>
          {registerHovered && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: "shimmer 1.5s infinite",
              }}
            />
          )}
        </button>

        {/* Повторная отправка */}
        <div style={{ textAlign: "center" }}>
          {timer > 0 ? (
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              Отправить код повторно через{" "}
              <span style={{ color: "#375DFB", fontWeight: 600 }}>
                {timer}с
              </span>
            </p>
          ) : (
            <button
              onMouseEnter={() => setResendHovered(true)}
              onMouseLeave={() => setResendHovered(false)}
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                fontSize: "14px",
                fontWeight: 500,
                color: resendHovered ? "#375DFB" : "#6B7280",
                cursor: "pointer",
                textDecoration: resendHovered ? "underline" : "none",
                transition: "all 0.2s ease",
                textShadow: resendHovered
                  ? "0 0 10px rgba(55,93,251,0.3)"
                  : "none",
              }}
            >
              Отправить код ещё раз
            </button>
          )}
        </div>

        {/* Ссылка назад */}
        <div style={{ textAlign: "center" }}>
          <Link
            to="/register"
            style={{
              fontSize: "14px",
              color: "#6B7280",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#375DFB";
              e.currentTarget.style.textShadow = "0 0 8px rgba(55,93,251,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6B7280";
              e.currentTarget.style.textShadow = "none";
            }}
          >
            ← Вернуться к регистрации
          </Link>
        </div>
      </div>

      {/* Копирайт */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 1,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.6%",
          color: "#FFFFFF",
          textShadow:
            "0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(55,93,251,0.3)",
        }}
      >
        © УТЦ «ВОЕВОДА» 2015–2025
      </div>

      {/* Анимации */}
      <style>{`
        @keyframes pulseGlow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes slowZoom {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.2); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
