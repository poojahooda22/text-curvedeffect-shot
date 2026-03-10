import { useEffect, useState } from "react";

export default function LandingUI() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}
    >
      {/* ── Navbar ── */}
      <nav
        className="pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-between px-8 h-14"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            letterSpacing: "0.02em",
          }}
        >
          Rare Labs.
        </span>

        {/* Nav links + availability */}
        <div className="flex items-center gap-8">
          {["Work", "About", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontFamily: "'Noto Sans', sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textDecoration: "none",
                color: "#000",
                textTransform: "uppercase",
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.7")}
            >
              {link}
            </a>
          ))}

          {/* Availability pill */}
          <span
            className="flex items-center gap-1.5"
            style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 400,
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "1px solid rgba(0,0,0,0.2)",
              padding: "4px 10px 4px 8px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#000",
                display: "inline-block",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            Available
          </span>
        </div>
      </nav>

      {/* ── Top center tag ── */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ top: "72px" }}
      >
        <span
          style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 300,
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          Portfolio — 2025
        </span>
      </div>

      {/* ── Vertical label: left edge ── */}
      <div
        className="absolute left-8 top-1/2"
        style={{
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "center center",
        }}
      >
        <span
          style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 300,
            fontSize: "9px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.65,
            whiteSpace: "nowrap",
          }}
        >
          Scroll to explore ↓
        </span>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-8 pb-7 pt-4"
        style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}
      >
        {/* Bottom left */}
        <div className="flex flex-col gap-1">
          <span
            style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 400,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Design × Development
          </span>
          <span
            style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 300,
              fontSize: "10px",
              letterSpacing: "0.08em",
              opacity: 0.55,
            }}
          >
            Open to projects
          </span>
        </div>

        {/* Bottom center */}
        <span
          style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 300,
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.6,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          © 2025
        </span>

        {/* Bottom right: CTA */}
        <a
          href="#"
          className="pointer-events-auto"
          style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "#000",
            border: "1px solid #000",
            padding: "10px 22px",
            display: "inline-block",
            transition: "background 0.25s ease, color 0.25s ease",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "#000";
            el.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "transparent";
            el.style.color = "#000";
          }}
        >
          Get in Touch →
        </a>
      </div>

      {/* ── Pulse dot keyframe ── */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
