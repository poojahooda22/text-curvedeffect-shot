import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

const LINE_GAP = 80;
const LINE_COLOR = "rgba(0,0,0,0.06)";
const DROP_DURATION = 600; // ms per line
const STAGGER = 30; // ms between each line

export default function LandingUI() {
  const [visible, setVisible] = useState(false);
  const dropletsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const lineCount = useMemo(
    () => Math.floor(window.innerWidth / LINE_GAP),
    []
  );

  useEffect(() => {
    if (!dropletsRef.current || lineCount === 0) return;

    const ctx = gsap.context(() => {
      const droplets = gsap.utils.toArray<HTMLElement>('.falling-droplet');

      droplets.forEach((drop) => {
        // Recursive function to animate each droplet sequentially
        const animateDrop = () => {
          const duration = gsap.utils.random(4, 7);
          const delay = gsap.utils.random(0, 10); // randomly start between 0 and 10 seconds

          gsap.fromTo(
            drop,
            {
              y: -20,
              opacity: gsap.utils.random(0.4, 1),
            },
            {
              y: window.innerHeight + 20,
              duration: duration,
              delay: delay,
              ease: "none",
              onComplete: animateDrop, // Repeat the animation after it finishes falling completely
            }
          );
        };

        // Start the continuous animation loop
        animateDrop();
      });
    }, dropletsRef);

    return () => ctx.revert();
  }, [lineCount]);

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}
    >
      {/* ── Animated falling grid lines ── */}
      <div className="absolute inset-0 overflow-hidden" ref={dropletsRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i / lineCount) * 100}%`,
              top: 0,
              width: "1.2px",
              height: "100%",
            }}
          >
            {/* The main grid line */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: LINE_COLOR,
                transform: "scaleY(0)",
                transformOrigin: "top",
                animation: `dropLine ${DROP_DURATION}ms ease-out ${i * STAGGER}ms forwards`,
              }}
            />
            {/* Single falling droplet per line */}
            <div
              className="falling-droplet"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "120%",
                height: `${Math.floor(Math.random() * 8) + 6}px`, // 6 to 14 pixels randomly
                background: "rgba(0,0,0,0.8)",
                opacity: 0, // initially hidden
              }}
            />
          </div>
        ))}
      </div>

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
        @keyframes dropLine {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
