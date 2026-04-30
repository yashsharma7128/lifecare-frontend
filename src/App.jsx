import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = "https://lifecare-node-backend.onrender.com/api";
// const API = "http://localhost:5000/api";

const api = {
  post: async (path, body, token = null) => {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
  get: async (path, token = null) => {
    const res = await fetch(`${API}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
  patch: async (path, body, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
  delete: async (path, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw await res.json();
    return true;
  },
};

// Token helpers
const saveToken = (access, refresh) => {
  localStorage.setItem("lc_access", access);
  localStorage.setItem("lc_refresh", refresh);
};
const getToken = () => localStorage.getItem("lc_access");
const clearTokens = () => {
  localStorage.removeItem("lc_access");
  localStorage.removeItem("lc_refresh");
};
const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("lc_refresh");
  if (!refresh) return null;
  try {
    const data = await api.post("/auth/token/refresh/", { refresh });
    localStorage.setItem("lc_access", data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
};

// ─── HARDCODED PRODUCTS ───────────────────────────────────────────────────────
const waterProducts = [
  {
    id: "WALL-RO",
    name: "Wall Mounted Storage RO",
    description:
      "Space-saving wall-mounted design with integrated 15L storage tank. Perfect for households and offices.",
    price: "₹12,500*",
    badge: "Popular",
    specs: [
      "15L storage",
      "7-stage purification",
      "Wall mount",
      "LED indicator",
    ],
    images: [
      "/images/wallMount.png",
      "/images/allMount.png",
      "/images/wall.png",
    ],
  },
  {
    id: "UNDER-SINK",
    name: "Under Sink Model",
    description: "Hidden under-counter installation for a clean kitchen.",
    price: "₹15,500*",
    badge: "Premium",
    specs: [
      "Under-counter install",
      "High-flow faucet",
      "NSF certified",
      "Compact",
    ],
    images: ["/images/under2.png"],
  },
  {
    id: "SMALL-RO",
    name: "Small Storage RO",
    description: "Compact and affordable for small families.",
    price: "₹6,499*",
    badge: "",
    specs: ["10L storage", "5-stage filtration", "Compact", "Easy install"],
    images: ["/images/small.png", "/images/smallOnWall.png"],
  },
  {
    id: "RO-75L",
    name: "RO 75 GPD",
    description:
      "Most popular home RO purifier. Removes bacteria, viruses, heavy metals.",
    price: "₹8,999*",
    badge: "Most Loved",
    specs: [
      "75 GPD",
      "6-stage purification",
      "TDS controller",
      "1 year warranty",
    ],
    images: ["/images/75.png", "/images/75.png", "/images/75.png"],
  },
  {
    id: "DM-PLANT",
    name: "DM Plant",
    description: "Industrial demineralization system.",
    price: "₹28,000*",
    badge: "",
    specs: ["Dual bed", "High purity", "Industrial", "Auto regen"],
    images: ["/images/dm.png", "/images/dm.png"],
  },
  {
    id: "COMM-RO",
    name: "Commercial RO Plant",
    description: "High-capacity RO system.",
    price: "₹45,000*",
    badge: "Bestseller",
    specs: ["500-5000 LPH", "Auto-flush", "Multi-stage", "TDS control"],
    images: ["/images/comm.png", "/images/comm.png", "/images/comm.png"],
  },
];

const airProduct = {
  id: "AIR-01",
  name: "Next Gen Air Purifier",
  price: "₹18,999*",
  description:
    "Advanced 7-stage purification eliminating PM2.5, PM10, VOCs, gases, allergens, bacteria and odors. Smart remote-controlled with real-time AQI display.",
  stages: [
    {
      n: 1,
      name: "Pre-Filter",
      desc: "Captures large dust particles and hair",
    },
    { n: 2, name: "HEPA H13", desc: "Traps 99.97% of particles ≥0.3 microns" },
    { n: 3, name: "Activated Carbon", desc: "Absorbs gases, VOCs and odors" },
    { n: 4, name: "Cold Catalyst", desc: "Breaks down formaldehyde" },
    { n: 5, name: "UV Sterilization", desc: "Eliminates bacteria and viruses" },
    { n: 6, name: "Negative Ion", desc: "Refreshes and energizes the air" },
    { n: 7, name: "Smart Sensor", desc: "Real-time AQI monitoring and alerts" },
  ],
  features: [
    "Remote Control",
    "PM2.5 Sensor",
    "Auto Mode",
    "Sleep Mode",
    "CADR 350 m³/h",
    "500 sq ft",
  ],
  suitable: ["Homes", "Offices", "Hospitals", "Hotels", "Schools"],
};

// ─── GLOBALS ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#0A2540",
  teal: "#00C9A7",
  tealLight: "#E1F5F2",
  blue: "#1A6FD4",
  blueLight: "#E8F4FD",
  gold: "#F59E0B",
  bg: "#F0F7FF",
  white: "#FFFFFF",
  muted: "#64748B",
  border: "#E2E8F0",
  success: "#E1F5F2",
  successText: "#0F6E56",
  danger: "#FFF0F0",
  dangerText: "#C53030",
};

// FIX 1: More reliable mobile detection with SSR safety
const useIsMobile = () => {
  const [mob, setMob] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 600 : false,
  );
  useEffect(() => {
    const h = () => setMob(window.innerWidth <= 600);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
};

const GlobalStyles = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      *{box-sizing:border-box;margin:0;padding:0}
      html{-webkit-text-size-adjust:100%}
      /* FIX 2: Prevent horizontal overflow on all screens */
      html, body {
        overflow-x: hidden;
        max-width: 100vw;
      }
      body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F7FF;color:#1A202C}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      .fade-up{animation:fadeUp 0.5s ease forwards}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#00C9A7;border-radius:3px}
      table{border-collapse:collapse;width:100%}
      /* FIX 3: Prevent text overflow on small screens */
      img { max-width: 100%; }
      /* FIX 4: Admin mobile tab scrollbar hidden but functional */
      .admin-tabs::-webkit-scrollbar { display: none; }
      .admin-tabs { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Btn = ({
  children,
  variant = "primary",
  onClick,
  style = {},
  disabled = false,
  full = false,
}) => {
  const base = {
    fontFamily: "inherit",
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    transition: "all 0.18s",
    opacity: disabled ? 0.65 : 1,
    width: full ? "100%" : "auto",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    display: "inline-block",
    textAlign: "center",
  };
  const v = {
    primary: { background: C.navy, color: "white" },
    teal: { background: C.teal, color: C.navy },
    outline: {
      background: "transparent",
      color: C.navy,
      border: `2px solid ${C.navy}`,
    },
    ghost: { background: C.blueLight, color: C.navy },
    danger: { background: "#E53E3E", color: "white" },
    white: {
      background: "rgba(255,255,255,0.12)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.3)",
    },
  };
  return (
    <button
      style={{ ...base, ...(v[variant] || v.primary), ...style }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Inp = ({ label, ...props }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: 5,
            fontWeight: 700,
            fontSize: 13,
            color: C.navy,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: "100%",
          padding: "12px 14px",
          border: `1.5px solid ${foc ? C.teal : C.border}`,
          borderRadius: 10,
          fontSize: 16,
          fontFamily: "inherit",
          outline: "none",
          background: "white",
          WebkitAppearance: "none",
        }}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        {...props}
      />
    </div>
  );
};

const Txtarea = ({ label, ...props }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: 5,
            fontWeight: 700,
            fontSize: 13,
            color: C.navy,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={{
          width: "100%",
          padding: "12px 14px",
          border: `1.5px solid ${foc ? C.teal : C.border}`,
          borderRadius: 10,
          fontSize: 16,
          fontFamily: "inherit",
          outline: "none",
          resize: "vertical",
          minHeight: 90,
          background: "white",
        }}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        {...props}
      />
    </div>
  );
};

const Sel = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label
        style={{
          display: "block",
          marginBottom: 5,
          fontWeight: 700,
          fontSize: 13,
          color: C.navy,
        }}
      >
        {label}
      </label>
    )}
    <select
      style={{
        width: "100%",
        padding: "12px 14px",
        border: `1.5px solid ${C.border}`,
        borderRadius: 10,
        fontSize: 16,
        fontFamily: "inherit",
        outline: "none",
        background: "white",
      }}
      {...props}
    >
      {children}
    </select>
  </div>
);

const Toast = ({ msg, type = "success" }) => {
  if (!msg) return null;
  const col =
    type === "success"
      ? { bg: C.success, text: C.successText, bdr: C.teal }
      : { bg: C.danger, text: C.dangerText, bdr: "#E53E3E" };
  return (
    <div
      style={{
        background: col.bg,
        border: `1.5px solid ${col.bdr}`,
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 14,
        color: col.text,
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {type === "success" ? "✓ " : "⚠ "}
      {msg}
    </div>
  );
};

const Badge = ({ text, color = "teal" }) => {
  if (!text) return null;
  const m = {
    teal: { bg: C.tealLight, text: "#0F6E56" },
    blue: { bg: C.blueLight, text: "#185FA5" },
    orange: { bg: "#FFF0EB", text: "#C04A1D" },
    gold: { bg: "#FEF3C7", text: "#92400E" },
  };
  const c = m[color] || m.teal;
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {text}
    </span>
  );
};

const StatusBadge = ({ s }) => {
  const m = {
    Active: { bg: C.tealLight, text: "#0F6E56" },
    Delivered: { bg: C.tealLight, text: "#0F6E56" },
    active: { bg: C.tealLight, text: "#0F6E56" },
    delivered: { bg: C.tealLight, text: "#0F6E56" },
    Expired: { bg: C.danger, text: C.dangerText },
    expired: { bg: C.danger, text: C.dangerText },
    Cancelled: { bg: C.danger, text: C.dangerText },
    Pending: { bg: "#FEF3C7", text: "#92400E" },
    pending: { bg: "#FEF3C7", text: "#92400E" },
    Resolved: { bg: C.blueLight, text: "#185FA5" },
    resolved: { bg: C.blueLight, text: "#185FA5" },
    Processing: { bg: "#F3EEFF", text: "#6D28D9" },
    processing: { bg: "#F3EEFF", text: "#6D28D9" },
  };
  const c = m[s] || { bg: C.blueLight, text: "#185FA5" };
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

const Spinner = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.teal}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const parseError = (err) => {
  if (typeof err === "string") return err;
  if (err?.detail) return err.detail;
  if (err?.error) return err.error;
  if (err?.non_field_errors) return err.non_field_errors[0];
  const first = Object.values(err || {})[0];
  if (Array.isArray(first)) return first[0];
  return "Something went wrong. Is the Django server running?";
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage, auth, logout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const mob = useIsMobile();
  const links = [
    ["Home", "home"],
    ["Water Purifiers", "water"],
    ["Air Purifiers", "air"],
    ["Brochures", "brochure"],
    ["Contact", "contact"],
  ];
  return (
    <nav
      style={{
        background: C.navy,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 20px rgba(10,37,64,0.4)",
        // FIX 5: Ensure navbar never causes overflow
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
          }}
          onClick={() => {
            setPage("home");
            setMenuOpen(false);
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              background: C.teal,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden", // important for circular crop
            }}
          >
            <img
              src="images/logo.jpeg" // replace with your logo path
              alt="logo"
              style={{
                width: "100%", // adjust size as needed
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Fraunces,serif",
                fontWeight: 700,
                fontSize: 13,
                color: "white",
                lineHeight: 1.1,
              }}
            >
              LIFE CARE
            </div>
            <div
              style={{
                fontSize: 7,
                color: C.teal,
                letterSpacing: 1.6,
                fontWeight: 800,
              }}
            >
              RO SYSTEMS
            </div>
          </div>
        </div>

        {!mob && (
          <div style={{ display: "flex", gap: 2 }}>
            {links.map(([l, p]) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  background: page === p ? C.teal : "transparent",
                  color: page === p ? C.navy : "rgba(255,255,255,0.82)",
                  border: "none",
                  padding: "7px 11px",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {!mob && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {auth ? (
              <>
                {auth.role === "admin" && (
                  <Btn
                    variant="ghost"
                    onClick={() => setPage("admin")}
                    style={{ fontSize: 12, padding: "6px 11px" }}
                  >
                    ⚙ Admin
                  </Btn>
                )}
                <Btn
                  variant="ghost"
                  onClick={() => setPage("dashboard")}
                  style={{ fontSize: 12, padding: "6px 11px" }}
                >
                  👤 {auth.name.split(" ")[0]}
                </Btn>
                <Btn
                  variant="teal"
                  onClick={logout}
                  style={{ fontSize: 12, padding: "6px 11px" }}
                >
                  Logout
                </Btn>
              </>
            ) : (
              <>
                {false && (
                  <Btn
                    variant="white"
                    onClick={() => setPage("login")}
                    style={{ fontSize: 12, padding: "6px 11px" }}
                  >
                    Login
                  </Btn>
                )}
                {false && (
                  <Btn
                    variant="teal"
                    onClick={() => setPage("register")}
                    style={{ fontSize: 12, padding: "6px 11px" }}
                  >
                    Register
                  </Btn>
                )}
              </>
            )}
          </div>
        )}

        {mob && (
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 22,
              cursor: "pointer",
              padding: "4px 6px",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {mob && menuOpen && (
        <div
          style={{
            background: "#0D2E4F",
            padding: "10px 16px 16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {links.map(([l, p]) => (
            <button
              key={p}
              onClick={() => {
                setPage(p);
                setMenuOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: page === p ? "rgba(0,201,167,0.15)" : "transparent",
                color: page === p ? C.teal : "rgba(255,255,255,0.82)",
                border: "none",
                padding: "12px 10px",
                borderRadius: 9,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "inherit",
                marginBottom: 4,
              }}
            >
              {l}
            </button>
          ))}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 12,
              marginTop: 8,
              display: "flex",
              gap: 8,
            }}
          >
            {auth ? (
              <>
                {auth.role === "admin" && (
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setPage("admin");
                      setMenuOpen(false);
                    }}
                    full
                    style={{ fontSize: 13 }}
                  >
                    ⚙ Admin
                  </Btn>
                )}
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setPage("dashboard");
                    setMenuOpen(false);
                  }}
                  full
                  style={{ fontSize: 13 }}
                >
                  👤 {auth.name.split(" ")[0]}
                </Btn>
                <Btn
                  variant="teal"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  full
                  style={{ fontSize: 13 }}
                >
                  Logout
                </Btn>
              </>
            ) : (
              <>
                <Btn
                  variant="white"
                  onClick={() => {
                    setPage("login");
                    setMenuOpen(false);
                  }}
                  full
                  style={{ fontSize: 13 }}
                >
                  Login
                </Btn>
                <Btn
                  variant="teal"
                  onClick={() => {
                    setPage("register");
                    setMenuOpen(false);
                  }}
                  full
                  style={{ fontSize: 13 }}
                >
                  Register
                </Btn>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => {
  const mob = useIsMobile();

  const feats = [
    {
      i: "🇮🇳",
      t: "Made in India",
      d: "Proudly designed & manufactured in India",
    },
    {
      i: "♻️",
      t: "No Water Wastage",
      d: "Zero-reject RO technology saves every drop",
    },
    {
      i: "🏠",
      t: "15,000+ Families",
      d: "Trusted across Delhi NCR for a decade",
    },
    { i: "📞", t: "One Call Service", d: "24–48 hour guaranteed response" },
  ];

  const services = [
    { i: "🚚", t: "Free Delivery", d: "24-48 hour doorstep delivery" },
    { i: "🔧", t: "Free Installation", d: "Professional setup at no cost" },
    { i: "🛡️", t: "1 Year Warranty", d: "Full product warranty" },
    { i: "📋", t: "AMC Available", d: "Annual Maintenance Contracts" },
  ];

  return (
    <div style={{ scrollBehavior: "smooth" }}>
      {/* HERO */}
      <section
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.7)), url('/images/image.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: mob ? "60px 18px" : "90px 20px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            {["ISO 9001:2015", "ISO Certified", "Water Quality Approved"].map(
              (c) => (
                <span
                  key={c}
                  style={{
                    background: "rgba(0,201,167,0.15)",
                    border: "1px solid rgba(0,201,167,0.35)",
                    color: "#00c9a7",
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {c}
                </span>
              ),
            )}
          </div>
          <h1
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: mob ? "clamp(34px,9vw,48px)" : "clamp(42px,6vw,64px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: "-0.5px",
              marginBottom: 16,
            }}
          >
            Pure Water.
            <br />
            <span style={{ color: "#00c9a7" }}>Pure Air.</span>
            <br />
            Pure Life.
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: mob ? 14 : 17,
              maxWidth: 520,
              marginBottom: 30,
              lineHeight: 1.7,
            }}
          >
            Delhi's most trusted RO & Air purification brand. Delivering safe,
            healthy living with advanced filtration systems.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn
              variant="teal"
              onClick={() => setPage("contact")}
              style={{
                padding: mob ? "12px 22px" : "15px 30px",
                fontSize: mob ? 13 : 15,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              📅 Book Service
            </Btn>
            <Btn
              variant="white"
              onClick={() => setPage("water")}
              style={{
                padding: mob ? "12px 22px" : "15px 30px",
                fontSize: mob ? 13 : 15,
              }}
            >
              View Products →
            </Btn>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        style={{
          background: "linear-gradient(135deg, #1abc9c, #16a085)",
          padding: "18px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
            textAlign: "center",
          }}
        >
          {[
            ["15,000+", "Happy Families"],
            ["24-48 hr", "Service"],
            ["20+", "Experience"],
            ["100%", "Certified"],
          ].map(([n, l]) => (
            <div key={l} style={{ padding: mob ? "8px 4px" : "0" }}>
              <div
                style={{
                  fontSize: mob ? 24 : 32,
                  fontWeight: 700,
                  color: "#083344",
                }}
              >
                {n}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#083344" }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: mob ? "32px 14px" : "52px 20px",
          background: "#f8fafc",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: 24,
              fontFamily: "Fraunces,serif",
            }}
          >
            Built on Trust & Quality
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {feats.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: mob ? 16 : 22,
                  textAlign: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontSize: 32 }}>{f.i}</div>
                <div style={{ fontWeight: 700, fontSize: mob ? 13 : 15 }}>
                  {f.t}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── reduced top padding */}
      <section
        style={{
          padding: mob ? "28px 14px 40px" : "36px 20px 60px",
          background: C.bg,
        }}
      >
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          {/* Header — tighter margin */}
          <div style={{ textAlign: "center", marginBottom: mob ? 16 : 22 }}>
            <h2
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: mob ? 26 : 34,
                color: C.navy,
                marginBottom: 5,
              }}
            >
              Our Products
            </h2>
            <p style={{ color: C.muted, fontSize: mob ? 13 : 15 }}>
              Water purifiers & air purifiers for every need
            </p>
          </div>

          {/* Quick nav buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginBottom: mob ? 16 : 22,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setPage("water")}
              style={{
                background: C.navy,
                color: "white",
                border: "none",
                borderRadius: 30,
                padding: "9px 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              💧 Water Purifiers
            </button>
            <button
              onClick={() => setPage("air")}
              style={{
                background: "white",
                color: C.navy,
                border: `2px solid ${C.border}`,
                borderRadius: 30,
                padding: "9px 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🌬️ Air Purifiers
            </button>
          </div>

          {/* WATER — 3 col desktop, 2 col mobile. No WATER pill, badge only if exists */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(3,1fr)",
              gap: mob ? 12 : 20,
              marginBottom: mob ? 14 : 20,
            }}
          >
            {waterProducts.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => setPage("water")}
                style={{
                  background: "white",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 18px rgba(10,37,64,0.09)",
                  cursor: "pointer",
                  border: `1.5px solid ${C.border}`,
                  position: "relative",
                  transition: "transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(10,37,64,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 18px rgba(10,37,64,0.09)";
                }}
              >
                {p.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: C.teal,
                      color: C.navy,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 20,
                      zIndex: 1,
                    }}
                  >
                    {p.badge}
                  </div>
                )}
                {/* Image — taller on desktop now that we have 3 cols */}
                <div
                  style={{
                    height: mob ? 140 : 210,
                    background: "#f8f9fb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                  }}
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
                <div
                  style={{ padding: mob ? "10px 12px 14px" : "14px 18px 18px" }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: mob ? 12 : 14,
                      color: C.navy,
                      marginBottom: 4,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      color: C.teal,
                      fontWeight: 800,
                      fontSize: mob ? 14 : 16,
                      marginBottom: 5,
                    }}
                  >
                    {p.price}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {p.specs.slice(0, 2).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AIR PURIFIER — full-width dark featured banner */}
          <div
            onClick={() => setPage("air")}
            style={{
              background:
                "linear-gradient(135deg, #0A2540 0%, #1a3a5c 60%, #0f2d4a 100%)",
              borderRadius: 20,
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              flexDirection: mob ? "column" : "row",
              alignItems: "center",
              border: "1.5px solid rgba(0,201,167,0.25)",
              boxShadow: "0 6px 30px rgba(10,37,64,0.2)",
              position: "relative",
            }}
          >
            {/* Subtle glow blobs */}
            <div
              style={{
                position: "absolute",
                top: -50,
                right: 80,
                width: 220,
                height: 220,
                background: "rgba(0,201,167,0.07)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -60,
                left: 40,
                width: 180,
                height: 180,
                background: "rgba(123,63,228,0.06)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            {/* Product image */}
            <div
              style={{
                width: mob ? "100%" : 260,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: mob ? "24px 24px 8px" : "24px 0px 24px 36px",
                minHeight: mob ? 180 : 0,
              }}
            >
              <img
                src="/images/air.jpeg"
                alt="Air Purifier"
                style={{
                  maxWidth: mob ? 150 : 190,
                  maxHeight: mob ? 150 : 180,
                  objectFit: "contain",
                  borderRadius: 12,
                  filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.35))",
                }}
              />
            </div>

            {/* Text */}
            <div
              style={{
                flex: 1,
                padding: mob ? "8px 24px 28px" : "28px 36px 28px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: "rgba(0,201,167,0.15)",
                    color: C.teal,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "1px solid rgba(0,201,167,0.3)",
                  }}
                >
                  NEW LAUNCH
                </span>
                <span
                  style={{
                    background: "rgba(123,63,228,0.2)",
                    color: "#C084FC",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  7-STAGE PURIFICATION
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 20 : 26,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 5,
                }}
              >
                {airProduct.name}
              </h3>
              <div
                style={{
                  fontSize: mob ? 18 : 22,
                  fontWeight: 800,
                  color: C.teal,
                  marginBottom: 10,
                }}
              >
                {airProduct.price}
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: mob ? 12 : 13,
                  lineHeight: 1.65,
                  marginBottom: 14,
                  maxWidth: 500,
                }}
              >
                Eliminates PM2.5, PM10, VOCs, bacteria & odors. Smart AQI
                display with remote control.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 18,
                }}
              >
                {airProduct.features.slice(0, mob ? 3 : 6).map((f) => (
                  <span
                    key={f}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 20,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.teal,
                  color: C.navy,
                  fontWeight: 800,
                  fontSize: 13,
                  padding: "10px 20px",
                  borderRadius: 10,
                }}
              >
                Explore Air Purifier →
              </div>
            </div>
          </div>

          {/* Bottom CTAs */}
          <div
            style={{
              textAlign: "center",
              marginTop: mob ? 18 : 26,
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Btn
              variant="primary"
              onClick={() => setPage("water")}
              style={{ padding: "11px 28px" }}
            >
              💧 All Water Purifiers
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => setPage("air")}
              style={{ padding: "11px 28px" }}
            >
              🌬️ View Air Purifier
            </Btn>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: mob ? 40 : 70, background: "#0f172a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              color: "white",
              marginBottom: 30,
              fontFamily: "Fraunces,serif",
            }}
          >
            What We Offer
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {services.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: mob ? 16 : 22,
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: mob ? 26 : 32 }}>{s.i}</div>
                <div
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: mob ? 13 : 15,
                  }}
                >
                  {s.t}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          padding: mob ? 40 : 60,
          background: "#1abc9c",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: mob ? 24 : 30,
            marginBottom: 10,
            fontFamily: "Fraunces,serif",
          }}
        >
          Ready for Purer Living?
        </h2>
        <p style={{ marginBottom: 20, fontSize: mob ? 14 : 16 }}>
          Limited Time Offer – Free Installation Included
        </p>
        <Btn
          onClick={() => setPage("contact")}
          style={{
            background: "#0f172a",
            color: "white",
            padding: "14px 32px",
            fontSize: 16,
          }}
        >
          Get Free Consultation
        </Btn>
      </section>
    </div>
  );
};

// ─── WATER PAGE ───────────────────────────────────────────────────────────────

const WaterPage = ({ setPage }) => {
  const mob = useIsMobile();

  const [expanded, setExpanded] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cardImageIndex, setCardImageIndex] = useState({});

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(
      (prev) =>
        (prev - 1 + selectedProduct.images.length) %
        selectedProduct.images.length,
    );
  };

  let startX = 0;
  const handleTouchStart = (e) => (startX = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextImage();
    if (endX - startX > 50) prevImage();
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: C.navy,
          padding: mob ? "36px 16px" : "44px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "white", fontSize: mob ? 30 : 40 }}>
          Water Purifiers
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)" }}>
          Advanced RO technology for pure water
        </p>
      </div>

      {/* GRID */}
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          padding: mob ? "20px 14px" : "44px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob
              ? "1fr"
              : "repeat(auto-fill,minmax(380px,1fr))",
            gap: 20,
          }}
        >
          {waterProducts.map((p) => {
            const currentIndex = cardImageIndex[p.id] || 0;

            return (
              <div
                key={p.id}
                style={{
                  background: "white",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 6px 24px rgba(10,37,64,0.12)",
                }}
              >
                {/* IMAGE */}
                <div
                  style={{
                    height: mob ? 260 : 320,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    padding: 10, // ✅ added padding for better fit
                  }}
                >
                  <img
                    src={p.images[currentIndex]}
                    onClick={() => {
                      setSelectedProduct(p);
                      setSelectedImageIndex(currentIndex);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "100%", // ✅ FULL WIDTH
                      height: "100%", // ✅ FULL HEIGHT
                      objectFit: "contain",
                    }}
                  />

                  {/* BADGE */}
                  {p.badge && (
                    <div style={{ position: "absolute", top: 10, right: 10 }}>
                      <Badge text={p.badge} />
                    </div>
                  )}

                  {/* DOTS */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    {p.images.map((_, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          setCardImageIndex((prev) => ({
                            ...prev,
                            [p.id]: i,
                          }))
                        }
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          cursor: "pointer",
                          background: currentIndex === i ? "#000" : "#ccc",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* CONTENT */}
                <div style={{ padding: mob ? 16 : 22 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h3 style={{ fontSize: mob ? 18 : 20 }}>{p.name}</h3>
                    <div style={{ color: C.teal, fontWeight: 700 }}>
                      {p.price}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, marginBottom: 12 }}>
                    {p.description}
                  </p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => setPage("contact")} style={{ flex: 1 }}>
                      Get Quote
                    </Btn>

                    <Btn
                      variant="ghost"
                      onClick={() =>
                        setExpanded(expanded === p.id ? null : p.id)
                      }
                      style={{ flex: 1 }}
                    >
                      {expanded === p.id ? "Less" : "Details"}
                    </Btn>
                  </div>

                  {expanded === p.id && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: C.bg,
                        borderRadius: 10,
                      }}
                    >
                      <p style={{ marginBottom: 8 }}>{p.description}</p>
                      {p.specs.map((s) => (
                        <div key={s}>✓ {s}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 1000,
              borderRadius: 16,
              display: "flex",
              flexDirection: mob ? "column" : "row",
            }}
          >
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ position: "relative" }}>
                <img
                  src={selectedProduct.images[selectedImageIndex]}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    width: "100%", // ✅ FULL WIDTH
                    height: mob ? 260 : 420, // ✅ increased height
                    objectFit: "contain",
                  }}
                />

                <button onClick={prevImage} style={arrow("left")}>
                  ‹
                </button>
                <button onClick={nextImage} style={arrow("right")}>
                  ›
                </button>
              </div>
            </div>

            <div style={{ flex: 1, padding: 20 }}>
              <h2>{selectedProduct.name}</h2>
              <h3 style={{ color: C.teal }}>{selectedProduct.price}</h3>
              <p>{selectedProduct.description}</p>
              {selectedProduct.specs.map((s) => (
                <div key={s}>✓ {s}</div>
              ))}
              <Btn
                onClick={() => setPage("contact")}
                style={{ marginTop: 20, width: "100%" }}
              >
                Get Quote
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const arrow = (side) => ({
  position: "absolute",
  top: "50%",
  [side]: 10,
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 40,
  height: 40,
  fontSize: 22,
  cursor: "pointer",
});
// ─── AIR PAGE ─────────────────────────────────────────────────────────────────
const AirPage = ({ setPage }) => {
  const mob = useIsMobile();
  const [activeStage, setActiveStage] = useState(null);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div
        style={{
          background: C.navy,
          padding: mob ? "36px 16px" : "44px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: mob ? 30 : 40,
            fontWeight: 700,
            color: "white",
            marginBottom: 8,
          }}
        >
          Air Purifiers
        </h1>
        <p style={{ color: "rgba(255,255,255,0.68)", fontSize: mob ? 13 : 15 }}>
          Next-generation purification for healthier breathing
        </p>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: mob ? "20px 14px" : "44px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 28px rgba(10,37,64,0.1)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1.3fr",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg,${C.blueLight},${C.tealLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: mob ? 32 : 52,
                minHeight: mob ? 160 : 260,
              }}
            >
              <img
                src="/images/air.jpeg"
                alt="Air Purifier"
                style={{ maxWidth: "100%", height: "auto", borderRadius: 12 }}
              />
            </div>

            <div style={{ padding: mob ? "18px" : "36px 32px" }}>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <Badge text="Next Generation" />
                <Badge text="Smart Control" color="blue" />
              </div>
              <h2
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 22 : 28,
                  fontWeight: 700,
                  color: C.navy,
                  marginBottom: 4,
                }}
              >
                {airProduct.name}
              </h2>
              <div
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 22 : 26,
                  color: C.teal,
                  marginBottom: 12,
                }}
              >
                {airProduct.price}
              </div>
              <p
                style={{
                  color: C.muted,
                  fontSize: mob ? 13 : 13.5,
                  lineHeight: 1.75,
                  marginBottom: 16,
                }}
              >
                {airProduct.description}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {airProduct.features.map((f) => (
                  <span
                    key={f}
                    style={{
                      background: C.tealLight,
                      color: "#0F6E56",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn
                  variant="primary"
                  onClick={() => setPage("contact")}
                  style={{ flex: 1, minWidth: 100 }}
                >
                  Get Quote
                </Btn>
                <Btn
                  variant="teal"
                  onClick={() => setPage("brochure")}
                  style={{ flex: 1, minWidth: 100 }}
                >
                  Download Brochure
                </Btn>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: mob ? "18px 14px" : "36px",
            boxShadow: "0 4px 22px rgba(10,37,64,0.07)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <h2
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: mob ? 22 : 28,
                fontWeight: 700,
                color: C.navy,
                marginBottom: 5,
              }}
            >
              7-Stage Purification
            </h2>
            <p style={{ color: C.muted, fontSize: 13 }}>
              Tap any stage to learn more
            </p>
          </div>

          {/* FIX 8: CRITICAL — was always repeat(4,1fr) regardless of screen size */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {airProduct.stages.map((s) => (
              <div
                key={s.n}
                onClick={() => setActiveStage(activeStage === s.n ? null : s.n)}
                style={{
                  background: activeStage === s.n ? C.navy : C.blueLight,
                  borderRadius: 12,
                  padding: mob ? "12px 8px" : "16px 10px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  border: `2px solid ${activeStage === s.n ? C.teal : "transparent"}`,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: activeStage === s.n ? C.teal : C.navy,
                    color: activeStage === s.n ? C.navy : "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 12,
                    margin: "0 auto 6px",
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: mob ? 11 : 11,
                    color: activeStage === s.n ? "white" : C.navy,
                    lineHeight: 1.3,
                  }}
                >
                  {s.name}
                </div>
                {activeStage === s.n && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.78)",
                      marginTop: 5,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.desc}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "repeat(2,1fr)",
              gap: 10,
            }}
          >
            {[
              ["PM2.5", "Fine particles, smoke", "#E53E3E"],
              ["PM10", "Dust, pollen, mold", "#F59E0B"],
              ["VOC / Gases", "Formaldehyde, odors", "#7B3FE4"],
              ["Bacteria", "Airborne pathogens", "#0F6E56"],
            ].map(([t, d, c]) => (
              <div
                key={t}
                style={{
                  padding: 12,
                  background: C.bg,
                  borderRadius: 10,
                  borderLeft: `4px solid ${c}`,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 3,
                    fontSize: 13,
                  }}
                >
                  {t}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── BROCHURE PAGE ────────────────────────────────────────────────────────────
const BrochurePage = () => {
  const mob = useIsMobile();
  const [counts, setCounts] = useState({ water: 0, air: 0 });
  const [dled, setDled] = useState({ water: false, air: false });
  const [loading, setLoading] = useState({ water: false, air: false });

  useEffect(() => {
    api
      .get("/brochure/counts/")
      .then(setCounts)
      .catch(() => {});
  }, []);

  const handleDownload = async (type) => {
    setLoading((l) => ({ ...l, [type]: true }));
    try {
      const data = await api.post(`/brochure/download/${type}/`, {});
      setCounts((c) => ({ ...c, [type]: data.count }));
    } catch {}
    setDled((d) => ({ ...d, [type]: true }));
    setLoading((l) => ({ ...l, [type]: false }));
    const a = document.createElement("a");
    a.href = `/brochures/${type}.pdf`;
    a.download = `lifecare-${type}-purifier-brochure.pdf`;
    a.click();
  };

  const brochures = [
    {
      key: "water",
      title: "Water Purifier Brochure",
      desc: "Specs for all 6 RO models: Commercial Plant, Wall Mount, Under Sink & home purifiers.",
      icon: "💧",
      accent: C.blue,
      lightBg: C.blueLight,
    },
    {
      key: "air",
      title: "Air Purifier Brochure",
      desc: "7-stage tech, technical specs & installation guide for Next Gen Air Purifier.",
      icon: "🌬️",
      accent: "#7B3FE4",
      lightBg: "#F3EEFF",
    },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div
        style={{
          background: C.navy,
          padding: mob ? "36px 16px" : "44px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: mob ? 30 : 40,
            fontWeight: 700,
            color: "white",
            marginBottom: 8,
          }}
        >
          Download Brochures
        </h1>
        <p style={{ color: "rgba(255,255,255,0.68)", fontSize: mob ? 13 : 15 }}>
          Detailed product specifications and technical guides
        </p>
      </div>

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: mob ? "22px 14px" : "52px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
            gap: 18,
            marginBottom: 22,
          }}
        >
          {brochures.map((b) => (
            <div
              key={b.key}
              style={{
                background: "white",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 4px 22px rgba(10,37,64,0.1)",
              }}
            >
              <div
                style={{
                  background: b.lightBg,
                  padding: mob ? "26px 20px" : "34px",
                  textAlign: "center",
                  borderBottom: `3px solid ${b.accent}`,
                }}
              >
                <div style={{ fontSize: mob ? 44 : 54, marginBottom: 12 }}>
                  {b.icon}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 56,
                    background: "white",
                    borderRadius: 7,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    📄
                  </div>
                  <div
                    style={{
                      height: 13,
                      background: b.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{ color: "white", fontSize: 8, fontWeight: 800 }}
                    >
                      PDF
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ padding: mob ? "16px" : "22px" }}>
                <h3
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 7,
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    color: C.muted,
                    fontSize: 12.5,
                    lineHeight: 1.65,
                    marginBottom: 8,
                  }}
                >
                  {b.desc}
                </p>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
                  📥 {counts[b.key] || 0} downloads
                </div>
                <Btn
                  onClick={() => handleDownload(b.key)}
                  disabled={loading[b.key]}
                  full
                  style={{
                    background: dled[b.key] ? "#10B981" : b.accent,
                    color: "white",
                    padding: "12px",
                  }}
                >
                  {loading[b.key]
                    ? "⏳ Tracking..."
                    : dled[b.key]
                      ? "✓ Downloaded!"
                      : "⬇ Download PDF"}
                </Btn>
              </div>
            </div>
          ))}
        </div>

        {/* <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: "14px 16px",
            textAlign: "center",
            border: `2px dashed ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              marginBottom: 7,
              wordBreak: "break-all",
            }}
          >
            📌 Place real PDFs at:{" "}
            <code
              style={{
                fontSize: 11,
                background: C.bg,
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              /public/brochures/water.pdf
            </code>{" "}
            and{" "}
            <code
              style={{
                fontSize: 11,
                background: C.bg,
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              air.pdf
            </code>
          </div>
        </div> */}
      </div>
    </div>
  );
};

const ContactPage = () => {
  const mob = useIsMobile();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const linkStyle = {
    color: C.navy,
    textDecoration: "none",
    fontWeight: 500,
  };

  const submit = async () => {
    setErr("");
    if (!form.name || !form.phone || !form.message) {
      setErr("All fields are required");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setErr("Enter valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact/", form);
      setDone(true);
    } catch (e) {
      setErr(parseError(e));
    }
    setLoading(false);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div
        style={{
          background: C.navy,
          padding: mob ? "36px 16px" : "44px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: mob ? 30 : 40,
            fontWeight: 700,
            color: "white",
            marginBottom: 8,
          }}
        >
          Contact Us
        </h1>
        <p style={{ color: "rgba(255,255,255,0.68)", fontSize: mob ? 13 : 15 }}>
          Reach out, we are here to help
        </p>
      </div>

      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: mob ? "18px 14px" : "44px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 1.2fr",
            gap: 18,
          }}
        >
          {/* LEFT SIDE */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: mob ? "18px" : "26px",
                boxShadow: "0 3px 18px rgba(10,37,64,0.07)",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: 20,
                  color: C.navy,
                  marginBottom: 18,
                }}
              >
                Get in Touch
              </h3>

              {/* ADDRESS */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={iconBox}>📍</div>
                <div>
                  <div style={labelStyle}>ADDRESS</div>
                  <div style={valueStyle}>
                    T-19, Malik Buildcon Plaza-2, Sector-12, Dwarka, New
                    Delhi-110075
                  </div>
                </div>
              </div>

              {/* PHONE */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={iconBox}>📞</div>
                <div>
                  <div style={labelStyle}>PHONE</div>
                  <div style={valueStyle}>
                    <a href="tel:9312670679" style={linkStyle}>
                      9312670679
                    </a>
                    {" | "}
                    <a
                      href="https://wa.me/919312670679?text=Hi%20I%20need%20RO%20service"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                    >
                      WhatsApp
                    </a>
                    <br />
                    <a href="tel:9212213717" style={linkStyle}>
                      9212213717
                    </a>
                    {" | "}
                    <a
                      href="https://wa.me/919212213717?text=Hi%20I%20need%20RO%20service"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                    >
                      WhatsApp
                    </a>
                    <br />
                  </div>
                </div>
              </div>

              {/* EMAIL */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={iconBox}>✉️</div>
                <div>
                  <div style={labelStyle}>EMAIL</div>
                  <div style={valueStyle}>
                    <a
                      href="mailto:lifecarerosystems@gmail.com?subject=RO Service Request&body=Hi I need RO service"
                      target="_blank"
                      style={linkStyle}
                    >
                      lifecarerosystems@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* INSTAGRAM */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={iconBox}>📸</div>
                <div>
                  <div style={labelStyle}>INSTAGRAM</div>
                  <div style={valueStyle}>
                    <a
                      href="https://www.instagram.com/lifecarerosystems/"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                    >
                      @lifecarerosystems
                    </a>
                  </div>
                </div>
              </div>

              {/* GOOGLE */}
              <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <div style={iconBox}>⭐</div>
                <div>
                  <div style={labelStyle}>GOOGLE</div>
                  <div style={valueStyle}>
                    <a
                      href="https://www.google.com/search?q=life+care+ro+systesms"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                    >
                      Drop a Review
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div
              style={{
                background: C.navy,
                borderRadius: 14,
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 10,
                }}
              >
                PAYMENT MODES
              </div>
              <div
                style={{ display: "flex", justifyContent: "center", gap: 10 }}
              >
                {["💵 Cash", "📱 UPI"].map((p) => (
                  <span
                    key={p}
                    style={{
                      background: "rgba(0,201,167,0.14)",
                      color: C.teal,
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: mob ? "18px" : "30px",
              boxShadow: "0 3px 18px rgba(10,37,64,0.07)",
            }}
          >
            <h3
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: 20,
                color: C.navy,
              }}
            >
              Send a Message
            </h3>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>
              We respond within 24 hours
            </p>

            {done ? (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: 54 }}>✅</div>
                <h4 style={{ fontSize: 22, color: C.navy }}>Message Sent!</h4>
              </div>
            ) : (
              <>
                {err && <Toast msg={err} type="error" />}
                <Inp
                  label="Full Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Inp
                  label="Phone Number *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Txtarea
                  label="Message *"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
                <Btn variant="primary" onClick={submit} disabled={loading} full>
                  {loading ? "⏳ Sending..." : "📨 Send Message"}
                </Btn>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* small reusable styles */
const iconBox = {
  width: 36,
  height: 36,
  background: C.tealLight,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelStyle = {
  fontSize: 9,
  fontWeight: 800,
  color: C.muted,
  letterSpacing: 1,
};

const valueStyle = {
  fontSize: 13,
  color: C.navy,
  lineHeight: 1.5,
};
// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginPage = ({ setPage, onLogin }) => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setErr("");
    if (!form.identifier || !form.password) {
      setErr("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post("/auth/login/", form);
      saveToken(data.access, data.refresh);
      onLogin(data.user, data.access);
      setPage(data.user.role === "admin" ? "admin" : "dashboard");
    } catch (e) {
      setErr(parseError(e));
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 54,
              height: 54,
              background: C.navy,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 22,
            }}
          >
            💧
          </div>
          <h2
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: 28,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: C.muted, fontSize: 13 }}>
            Sign in with your username or email
          </p>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 40px rgba(10,37,64,0.1)",
          }}
        >
          {err && <Toast msg={err} type="error" />}
          <Inp
            label="Username or Email"
            placeholder="Enter username or email"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <Inp
            label="Password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <Btn
            variant="primary"
            onClick={login}
            disabled={loading}
            full
            style={{ padding: "13px", fontSize: 15, marginBottom: 12 }}
          >
            {loading ? "⏳ Signing in..." : "Sign In"}
          </Btn>
          <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
            No account?{" "}
            <span
              style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}
              onClick={() => setPage("register")}
            >
              Register here
            </span>
          </div>
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: C.bg,
              borderRadius: 9,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: C.muted,
                marginBottom: 4,
                letterSpacing: 1,
              }}
            >
              API ENDPOINT
            </div>
            <code style={{ fontSize: 11, color: C.navy }}>
              POST /api/auth/login/
            </code>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Body: identifier (username or email) + password
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const RegisterPage = ({ setPage, onLogin }) => {
  const mob = useIsMobile();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setErr("");
    const { name, username, email, phone, password, confirm } = form;
    if (!name || !username || !email || !phone || !password) {
      setErr("All fields are required");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post("/auth/register/", {
        name,
        username,
        email,
        phone,
        password,
      });
      saveToken(data.access, data.refresh);
      onLogin(data.user, data.access);
      setPage("dashboard");
    } catch (e) {
      setErr(parseError(e));
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        paddingTop: 30,
        paddingBottom: 30,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: 28,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            Create Account
          </h2>
          <p style={{ color: C.muted, fontSize: 13 }}>
            Register via POST /api/auth/register/
          </p>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: mob ? "18px" : "26px",
            boxShadow: "0 8px 40px rgba(10,37,64,0.1)",
          }}
        >
          {err && <Toast msg={err} type="error" />}
          <Inp
            label="Full Name"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* FIX 9: Was always 2-col grid — now stacks on mobile */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: 10,
            }}
          >
            <Inp
              label="Username"
              placeholder="Choose username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoCapitalize="none"
            />
            <Inp
              label="Phone"
              type="tel"
              placeholder="Mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <Inp
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoCapitalize="none"
          />

          {/* FIX 10: Was always 2-col grid — now stacks on mobile */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: 10,
            }}
          >
            <Inp
              label="Password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Inp
              label="Confirm"
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          <Btn
            variant="primary"
            onClick={register}
            disabled={loading}
            full
            style={{ padding: "13px", fontSize: 15, marginBottom: 12 }}
          >
            {loading ? "⏳ Creating..." : "Create Account"}
          </Btn>
          <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
            Already registered?{" "}
            <span
              style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}
              onClick={() => setPage("login")}
            >
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
const UserDashboard = ({ auth, token, setPage }) => {
  const mob = useIsMobile();
  const [orders, setOrders] = useState([]);
  const [amcs, setAmcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [o, a] = await Promise.all([
          api.get("/orders/", token),
          api.get("/amc/", token),
        ]);
        setOrders(Array.isArray(o) ? o : o.results || []);
        setAmcs(Array.isArray(a) ? a : a.results || []);
      } catch (e) {
        setErr(parseError(e));
      }
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        padding: mob ? "14px" : "28px 20px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {err && <Toast msg={err} type="error" />}

        <div
          style={{
            background: C.navy,
            borderRadius: 18,
            padding: mob ? "16px" : "22px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: C.teal,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              color: C.navy,
              flexShrink: 0,
            }}
          >
            {auth.name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: mob ? 19 : 23,
                fontWeight: 700,
                color: "white",
                marginBottom: 2,
              }}
            >
              Welcome, {auth.name.split(" ")[0]}!
            </h2>
            <div
              style={{
                color: "rgba(255,255,255,0.58)",
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {auth.email}
            </div>
          </div>
        </div>

        {/* FIX 11: Was always repeat(3,1fr) — now wraps naturally on small phones */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr 1fr 1fr" : "repeat(3,1fr)",
            gap: mob ? 8 : 12,
            marginBottom: 18,
          }}
        >
          {[
            ["Purchases", orders.length, "📦"],
            ["AMC Plans", amcs.length, "📋"],
            ["Role", auth.role, "👤"],
          ].map(([l, v, i]) => (
            <div
              key={l}
              style={{
                background: "white",
                borderRadius: 14,
                padding: mob ? "10px 6px" : "18px",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(10,37,64,0.06)",
              }}
            >
              <div style={{ fontSize: mob ? 18 : 26, marginBottom: 4 }}>
                {i}
              </div>
              <div
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 16 : 24,
                  fontWeight: 700,
                  color: C.navy,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: mob ? 9 : 11,
                  color: C.muted,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: mob ? "14px" : "22px",
            marginBottom: 16,
            boxShadow: "0 2px 12px rgba(10,37,64,0.06)",
          }}
        >
          <h3
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: 18,
              color: C.navy,
              marginBottom: 14,
            }}
          >
            My Orders{" "}
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
              — from /api/orders/
            </span>
          </h3>
          {orders.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "24px 0", color: C.muted }}
            >
              <div style={{ fontSize: 38 }}>🛒</div>
              <p style={{ marginTop: 10, fontSize: 13 }}>
                No orders yet.{" "}
                <span
                  style={{ color: C.teal, cursor: "pointer" }}
                  onClick={() => setPage("water")}
                >
                  Explore products
                </span>
              </p>
            </div>
          ) : (
            <div
              style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
            >
              <table style={{ minWidth: 380 }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {["Order", "Product", "Amount", "Payment", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 800,
                            color: C.muted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      style={{ borderTop: `1px solid ${C.border}` }}
                    >
                      <td
                        style={{
                          padding: "10px",
                          fontSize: 11,
                          color: C.muted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.order_id}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: C.navy,
                        }}
                      >
                        {o.product_name}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontSize: 12.5,
                          color: C.teal,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.amount}
                      </td>
                      <td style={{ padding: "10px", fontSize: 12 }}>
                        {o.payment_mode}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <StatusBadge s={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AMC */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: mob ? "14px" : "22px",
            boxShadow: "0 2px 12px rgba(10,37,64,0.06)",
          }}
        >
          <h3
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: 18,
              color: C.navy,
              marginBottom: 14,
            }}
          >
            AMC Plans{" "}
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
              — from /api/amc/
            </span>
          </h3>
          {amcs.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "22px 0", color: C.muted }}
            >
              <div style={{ fontSize: 38 }}>📋</div>
              <p style={{ marginTop: 10, fontSize: 13 }}>
                No AMC plans.{" "}
                <span
                  style={{ color: C.teal, cursor: "pointer" }}
                  onClick={() => setPage("contact")}
                >
                  Contact us
                </span>
              </p>
            </div>
          ) : (
            amcs.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: "14px",
                  background: C.bg,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: C.navy,
                        marginBottom: 2,
                        fontSize: 14,
                      }}
                    >
                      {a.product_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>
                      Valid: {a.start_date} to {a.end_date}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>
                      Next service: {a.next_service}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge s={a.status} />
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.teal,
                        marginTop: 5,
                      }}
                    >
                      {a.amount}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = ({ auth, token, setPage }) => {
  const mob = useIsMobile();
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [amcs, setAmcs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ msg: "", type: "success" });
  const [showForms, setShowForms] = useState({
    user: false,
    order: false,
    amc: false,
  });
  const [nUser, setNU] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [nOrder, setNO] = useState({
    user: "",
    product_id: "",
    product_name: "",
    amount: "",
    payment_mode: "cash",
    status: "delivered",
  });
  const [nAMC, setNA] = useState({
    user: "",
    product_id: "",
    product_name: "",
    start_date: "",
    end_date: "",
    amount: "",
    next_service: "",
  });
  const allProducts = [...waterProducts, airProduct];

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif({ msg: "", type: "success" }), 3000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, o, a, c, d] = await Promise.all([
        api.get("/users/", token),
        api.get("/orders/", token),
        api.get("/amc/", token),
        api.get("/contact/list/", token),
        api.get("/admin/dashboard/", token),
      ]);
      setUsers(Array.isArray(u) ? u : u.results || []);
      setOrders(Array.isArray(o) ? o : o.results || []);
      setAmcs(Array.isArray(a) ? a : a.results || []);
      setContacts(Array.isArray(c) ? c : c.results || []);
      setDashStats(d);
    } catch (e) {
      notify(parseError(e), "error");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const addUser = async () => {
    if (!nUser.name || !nUser.username || !nUser.email) {
      notify("Fill required fields", "error");
      return;
    }
    try {
      await api.post("/users/", nUser, token);
      setNU({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
      });
      setShowForms({ ...showForms, user: false });
      loadAll();
      notify("User created");
    } catch (e) {
      notify(parseError(e), "error");
    }
  };

  const delUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}/`, token);
      loadAll();
      notify("User deleted");
    } catch (e) {
      notify(parseError(e), "error");
    }
  };

  const addOrder = async () => {
    const prod = allProducts.find((p) => p.id === nOrder.product_id);
    if (!nOrder.user || !prod) {
      notify("Select valid user and product", "error");
      return;
    }
    try {
      await api.post(
        "/orders/",
        {
          ...nOrder,
          product_name: prod.name,
          amount: nOrder.amount || prod.price,
        },
        token,
      );
      setNO({
        user: "",
        product_id: "",
        product_name: "",
        amount: "",
        payment_mode: "cash",
        status: "delivered",
      });
      setShowForms({ ...showForms, order: false });
      loadAll();
      notify("Order created");
    } catch (e) {
      notify(parseError(e), "error");
    }
  };

  const addAMC = async () => {
    const prod = allProducts.find((p) => p.id === nAMC.product_id);
    if (!nAMC.user || !prod) {
      notify("Select valid user and product", "error");
      return;
    }
    try {
      await api.post("/amc/", { ...nAMC, product_name: prod.name }, token);
      setNA({
        user: "",
        product_id: "",
        product_name: "",
        start_date: "",
        end_date: "",
        amount: "",
        next_service: "",
      });
      setShowForms({ ...showForms, amc: false });
      loadAll();
      notify("AMC plan added");
    } catch (e) {
      notify(parseError(e), "error");
    }
  };

  const resolveContact = async (id) => {
    try {
      await api.patch(`/contact/${id}/`, { status: "resolved" }, token);
      loadAll();
      notify("Marked resolved");
    } catch (e) {
      notify(parseError(e), "error");
    }
  };

  const tabs = [
    ["dashboard", "📊", "Dashboard"],
    ["users", "👥", "Users"],
    ["products", "💧", "Products"],
    ["billing", "🧾", "Billing"],
    ["amc", "📋", "AMC"],
    ["contacts", "📩", "Contacts"],
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: mob ? "column" : "row",
        minHeight: "calc(100vh - 60px)",
        background: C.bg,
      }}
    >
      {/* FIX 12: Admin sidebar — hidden scrollbar on mobile, full labels visible */}
      <div
        className="admin-tabs"
        style={{
          width: mob ? "100%" : 196,
          background: C.navy,
          display: "flex",
          flexDirection: mob ? "row" : "column",
          padding: mob ? "8px 10px" : undefined,
          paddingTop: mob ? undefined : 20,
          paddingBottom: mob ? undefined : 16,
          paddingLeft: mob ? undefined : 10,
          paddingRight: mob ? undefined : 10,
          overflowX: mob ? "auto" : "visible",
          flexShrink: 0,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {!mob && (
          <div style={{ padding: "0 12px", marginBottom: 20 }}>
            <div
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: 14,
                color: "white",
                marginBottom: 2,
              }}
            >
              Admin Panel
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              {auth.name}
            </div>
          </div>
        )}
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex",
              flexDirection: mob ? "column" : "row",
              alignItems: "center",
              gap: mob ? 2 : 9,
              padding: mob ? "8px 10px" : "10px 14px",
              borderRadius: 8,
              border: "none",
              background: tab === id ? C.teal : "transparent",
              color: tab === id ? C.navy : "rgba(255,255,255,0.68)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: tab === id ? 700 : 500,
              fontSize: mob ? 10 : 12.5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: mob ? 60 : undefined,
              marginBottom: mob ? 0 : 3,
            }}
          >
            <span style={{ fontSize: mob ? 17 : 14 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
        {!mob && (
          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() => setPage("home")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                width: "100%",
              }}
            >
              ↩ Back to Site
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: mob ? "12px" : "22px",
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: 0,
        }}
      >
        {notif.msg && <Toast msg={notif.msg} type={notif.type} />}
        {loading && <Spinner />}

        {/* DASHBOARD */}
        {!loading && tab === "dashboard" && dashStats && (
          <div>
            <h2
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: mob ? 21 : 26,
                color: C.navy,
                marginBottom: 16,
              }}
            >
              Dashboard{" "}
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
                — /api/admin/dashboard/
              </span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                ["Users", dashStats.total_users, "👥", C.teal],
                ["Orders", dashStats.total_orders, "📦", C.blue],
                ["Active AMC", dashStats.active_amc, "📋", "#7B3FE4"],
                ["Pending Inquiries", dashStats.pending_contacts, "📩", C.gold],
              ].map(([l, v, i, c]) => (
                <div
                  key={l}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    padding: mob ? "13px" : "18px",
                    boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                    borderTop: `3px solid ${c}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{ fontSize: 9, fontWeight: 800, color: C.muted }}
                    >
                      {l.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 16 }}>{i}</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "Fraunces,serif",
                      fontSize: mob ? 22 : 30,
                      fontWeight: 700,
                      color: C.navy,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 14,
                padding: mob ? "14px" : "20px",
                boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: 16,
                  color: C.navy,
                  marginBottom: 12,
                }}
              >
                Brochure Downloads
              </h3>
              {Object.entries(dashStats.brochure_downloads || {}).map(
                ([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 13, color: C.navy, fontWeight: 600 }}
                    >
                      {k === "water" ? "💧 Water Purifier" : "🌬️ Air Purifier"}
                    </div>
                    <div
                      style={{
                        fontFamily: "Fraunces,serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.blue,
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 14,
                padding: mob ? "14px" : "20px",
                boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
              }}
            >
              <h3
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: 16,
                  color: C.navy,
                  marginBottom: 12,
                }}
              >
                Recent Orders
              </h3>
              {(dashStats.recent_orders || []).map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: `1px solid ${C.border}`,
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}
                    >
                      {o.user_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>
                      {o.product_name}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <span
                      style={{ fontSize: 13, color: C.teal, fontWeight: 700 }}
                    >
                      {o.amount}
                    </span>
                    <StatusBadge s={o.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && tab === "users" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h2
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 21 : 26,
                  color: C.navy,
                }}
              >
                Users{" "}
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
                  — /api/users/
                </span>
              </h2>
              <Btn
                variant="teal"
                onClick={() =>
                  setShowForms({ ...showForms, user: !showForms.user })
                }
              >
                + Add User
              </Btn>
            </div>

            {showForms.user && (
              <div
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: mob ? "14px" : "20px",
                  marginBottom: 14,
                  border: `2px solid ${C.teal}`,
                }}
              >
                <h4
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontSize: 16,
                    color: C.navy,
                    marginBottom: 12,
                  }}
                >
                  New User → POST /api/users/
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Inp
                    label="Full Name"
                    value={nUser.name}
                    onChange={(e) => setNU({ ...nUser, name: e.target.value })}
                  />
                  <Inp
                    label="Username"
                    value={nUser.username}
                    onChange={(e) =>
                      setNU({ ...nUser, username: e.target.value })
                    }
                  />
                  <Inp
                    label="Email"
                    value={nUser.email}
                    onChange={(e) => setNU({ ...nUser, email: e.target.value })}
                  />
                  <Inp
                    label="Phone"
                    value={nUser.phone}
                    onChange={(e) => setNU({ ...nUser, phone: e.target.value })}
                  />
                  <Inp
                    label="Password"
                    type="password"
                    value={nUser.password}
                    onChange={(e) =>
                      setNU({ ...nUser, password: e.target.value })
                    }
                  />
                  <Sel
                    label="Role"
                    value={nUser.role}
                    onChange={(e) => setNU({ ...nUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Sel>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="teal" onClick={addUser}>
                    Save
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => setShowForms({ ...showForms, user: false })}
                  >
                    Cancel
                  </Btn>
                </div>
              </div>
            )}

            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 10,
                  boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, color: C.navy, marginBottom: 2 }}
                  >
                    {u.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {u.username} · {u.phone}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.muted,
                      wordBreak: "break-all",
                    }}
                  >
                    {u.email}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Badge
                    text={u.role}
                    color={u.role === "admin" ? "teal" : "blue"}
                  />
                  {u.id !== auth.id && (
                    <Btn
                      variant="danger"
                      onClick={() => delUser(u.id)}
                      style={{ fontSize: 11, padding: "4px 10px" }}
                    >
                      Delete
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS */}
        {!loading && tab === "products" && (
          <div>
            <h2
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: mob ? 21 : 26,
                color: C.navy,
                marginBottom: 6,
              }}
            >
              Products
            </h2>
            <div
              style={{
                background: C.blueLight,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "#185FA5",
                fontWeight: 600,
              }}
            >
              ℹ️ Products are hardcoded in the frontend. Orders reference them
              by product_id in the database.
            </div>
            {[...waterProducts, airProduct].map((p) => (
              <div
                key={p.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 10,
                  boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: C.navy,
                      marginBottom: 3,
                      fontSize: 14,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.teal,
                      fontWeight: 700,
                      marginBottom: 3,
                    }}
                  >
                    {p.price}
                  </div>
                  <code
                    style={{
                      background: C.blueLight,
                      color: "#185FA5",
                      padding: "2px 7px",
                      borderRadius: 5,
                      fontSize: 11,
                    }}
                  >
                    {p.id}
                  </code>
                </div>
                <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: C.navy }}
                  >
                    {orders.filter((o) => o.product_id === p.id).length} orders
                  </span>
                  <Badge text="Active" color="teal" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BILLING */}
        {!loading && tab === "billing" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h2
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 21 : 26,
                  color: C.navy,
                }}
              >
                Billing{" "}
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
                  — /api/orders/
                </span>
              </h2>
              <Btn
                variant="teal"
                onClick={() =>
                  setShowForms({ ...showForms, order: !showForms.order })
                }
              >
                + New Order
              </Btn>
            </div>

            {showForms.order && (
              <div
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: mob ? "14px" : "20px",
                  marginBottom: 14,
                  border: `2px solid ${C.teal}`,
                }}
              >
                <h4
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontSize: 16,
                    color: C.navy,
                    marginBottom: 12,
                  }}
                >
                  Create Order → POST /api/orders/
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Sel
                    label="Customer"
                    value={nOrder.user}
                    onChange={(e) => setNO({ ...nOrder, user: e.target.value })}
                  >
                    <option value="">Select customer</option>
                    {users
                      .filter((u) => u.role !== "admin")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </Sel>
                  <Sel
                    label="Product"
                    value={nOrder.product_id}
                    onChange={(e) =>
                      setNO({ ...nOrder, product_id: e.target.value })
                    }
                  >
                    <option value="">Select product</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Sel>
                  <Inp
                    label="Amount (optional)"
                    placeholder="Leave blank for product price"
                    value={nOrder.amount}
                    onChange={(e) =>
                      setNO({ ...nOrder, amount: e.target.value })
                    }
                  />
                  <Sel
                    label="Payment Mode"
                    value={nOrder.payment_mode}
                    onChange={(e) =>
                      setNO({ ...nOrder, payment_mode: e.target.value })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </Sel>
                  <Sel
                    label="Status"
                    value={nOrder.status}
                    onChange={(e) =>
                      setNO({ ...nOrder, status: e.target.value })
                    }
                  >
                    <option value="delivered">Delivered</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </Sel>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="teal" onClick={addOrder}>
                    Create
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => setShowForms({ ...showForms, order: false })}
                  >
                    Cancel
                  </Btn>
                </div>
              </div>
            )}

            {orders.map((o) => (
              <div
                key={o.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 10,
                  boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: C.navy,
                        marginBottom: 2,
                      }}
                    >
                      {o.user_name}
                    </div>
                    <div
                      style={{ fontSize: 12.5, color: C.navy, marginBottom: 2 }}
                    >
                      {o.product_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>
                      {o.order_id} · {o.created_at?.slice(0, 10)} ·{" "}
                      {o.payment_mode}
                    </div>
                    <code
                      style={{
                        fontSize: 10,
                        background: C.blueLight,
                        color: "#185FA5",
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {o.product_id}
                    </code>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: C.teal,
                        marginBottom: 5,
                      }}
                    >
                      {o.amount}
                    </div>
                    <StatusBadge s={o.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AMC */}
        {!loading && tab === "amc" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h2
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: mob ? 21 : 26,
                  color: C.navy,
                }}
              >
                AMC{" "}
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
                  — /api/amc/
                </span>
              </h2>
              <Btn
                variant="teal"
                onClick={() =>
                  setShowForms({ ...showForms, amc: !showForms.amc })
                }
              >
                + Add AMC
              </Btn>
            </div>

            {showForms.amc && (
              <div
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: mob ? "14px" : "20px",
                  marginBottom: 14,
                  border: `2px solid ${C.teal}`,
                }}
              >
                <h4
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontSize: 16,
                    color: C.navy,
                    marginBottom: 12,
                  }}
                >
                  New AMC → POST /api/amc/
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Sel
                    label="Customer"
                    value={nAMC.user}
                    onChange={(e) => setNA({ ...nAMC, user: e.target.value })}
                  >
                    <option value="">Select customer</option>
                    {users
                      .filter((u) => u.role !== "admin")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </Sel>
                  <Sel
                    label="Product"
                    value={nAMC.product_id}
                    onChange={(e) =>
                      setNA({ ...nAMC, product_id: e.target.value })
                    }
                  >
                    <option value="">Select product</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Sel>
                  <Inp
                    label="Start Date"
                    type="date"
                    value={nAMC.start_date}
                    onChange={(e) =>
                      setNA({ ...nAMC, start_date: e.target.value })
                    }
                  />
                  <Inp
                    label="End Date"
                    type="date"
                    value={nAMC.end_date}
                    onChange={(e) =>
                      setNA({ ...nAMC, end_date: e.target.value })
                    }
                  />
                  <Inp
                    label="Amount"
                    placeholder="e.g. ₹1,500"
                    value={nAMC.amount}
                    onChange={(e) => setNA({ ...nAMC, amount: e.target.value })}
                  />
                  <Inp
                    label="Next Service Date"
                    type="date"
                    value={nAMC.next_service}
                    onChange={(e) =>
                      setNA({ ...nAMC, next_service: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="teal" onClick={addAMC}>
                    Save AMC
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => setShowForms({ ...showForms, amc: false })}
                  >
                    Cancel
                  </Btn>
                </div>
              </div>
            )}

            {amcs.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 10,
                  boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: C.navy,
                        marginBottom: 2,
                      }}
                    >
                      {a.user_name}
                    </div>
                    <div
                      style={{ fontSize: 13, color: C.navy, marginBottom: 2 }}
                    >
                      {a.product_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>
                      {a.start_date} → {a.end_date}
                    </div>
                    <div
                      style={{ fontSize: 11.5, color: C.blue, fontWeight: 600 }}
                    >
                      Next: {a.next_service}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge s={a.status} />
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.teal,
                        marginTop: 5,
                      }}
                    >
                      {a.amount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTACTS */}
        {!loading && tab === "contacts" && (
          <div>
            <h2
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: mob ? 21 : 26,
                color: C.navy,
                marginBottom: 16,
              }}
            >
              Inquiries{" "}
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
                — /api/contact/list/
              </span>
            </h2>
            {contacts.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 10,
                  boxShadow: "0 2px 10px rgba(10,37,64,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: C.navy }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: C.muted }}>
                      📞 {c.phone} · {c.created_at?.slice(0, 10)}
                    </div>
                  </div>
                  <StatusBadge s={c.status} />
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: C.navy,
                    background: C.bg,
                    padding: "10px 12px",
                    borderRadius: 8,
                    marginBottom: c.status === "pending" ? 10 : 0,
                    lineHeight: 1.6,
                  }}
                >
                  {c.message}
                </p>
                {c.status === "pending" && (
                  <Btn
                    variant="ghost"
                    onClick={() => resolveContact(c.id)}
                    style={{ fontSize: 12, padding: "7px 14px" }}
                  >
                    ✓ Mark Resolved → PATCH /api/contact/{c.id}/
                  </Btn>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = ({ setPage }) => {
  const mob = useIsMobile();

  const linkStyle = {
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
  };

  return (
    <footer
      style={{
        background: "#050F1C",
        color: "rgba(255,255,255,0.65)",
        padding: mob ? "36px 16px 20px" : "48px 20px 24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)",
            gap: mob ? "24px 16px" : 36,
            marginBottom: 28,
          }}
        >
          {/* LOGO + ADDRESS */}
          <div style={{ gridColumn: mob ? "span 2" : "span 1" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: C.teal,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src="images/logo.jpeg"
                  alt="logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "Fraunces,serif",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "white",
                  }}
                >
                  LIFE CARE RO SYSTEMS
                </div>
                <div
                  style={{
                    fontSize: 7,
                    color: C.teal,
                    letterSpacing: 1.5,
                    fontWeight: 800,
                  }}
                >
                  PURE WATER · PURE AIR
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, lineHeight: 1.8 }}>
              T-19, Malik Buildcon Plaza-2, Sector-12, Dwarka, New Delhi -
              110075
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 11,
                fontSize: 12,
              }}
            >
              Quick Links
            </div>

            {[
              ["Home", "home"],
              ["Water Purifiers", "water"],
              ["Air Purifiers", "air"],
              ["Brochure", "brochure"],
              ["Contact", "contact"],
            ].map(([l, p]) => (
              <div key={p} style={{ marginBottom: 8 }}>
                <span
                  style={{ cursor: "pointer", fontSize: 12.5 }}
                  onClick={() => setPage(p)}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>

          {/* CONTACT */}
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 11,
                fontSize: 12,
              }}
            >
              Contact
            </div>

            {/* Phone 1 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span>📞</span>
              <a href="tel:9312670679" style={linkStyle}>
                9312670679
              </a>
              {" | "}
              <a
                href="https://wa.me/919312670679?text=Hi%20I%20need%20RO%20service"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                WhatsApp
              </a>
            </div>

            {/* Phone 2 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span>📱</span>
              <a href="tel:9212213717" style={linkStyle}>
                9212213717
              </a>
              {" | "}
              <a
                href="https://wa.me/919212213717?text=Hi%20I%20need%20RO%20service"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                WhatsApp
              </a>
            </div>

            {/* Email */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span>✉️</span>
              <a
                href="mailto:lifecarerosystems@gmail.com?subject=RO Service Request&body=Hi I need RO service"
                target="_blank"
                style={linkStyle}
              >
                lifecarerosystems@gmail.com
              </a>
            </div>

            {/* Instagram */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span>📸</span>
              <a
                href="https://www.instagram.com/lifecarerosystems/"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                @lifecarerosystems
              </a>
            </div>

            {/* Google */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span>⭐</span>
              <a
                href="https://www.google.com/search?q=life+care+ro+systesms"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Drop a Review
              </a>
            </div>
          </div>

          {/* PAYMENT */}
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 11,
                fontSize: 12,
              }}
            >
              Payment
            </div>

            {["💵 Cash", "📱 UPI"].map((p) => (
              <div
                key={p}
                style={{
                  background: "rgba(0,201,167,0.07)",
                  border: "1px solid rgba(0,201,167,0.14)",
                  color: C.teal,
                  padding: "8px 12px",
                  borderRadius: 8,
                  marginBottom: 7,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {p}
              </div>
            ))}

            <div style={{ fontSize: 12, marginTop: 8 }}>
              ⏰ Service in 24-48 hrs
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 11 }}>
            © 2024 Life Care RO Systems. All rights reserved.
          </div>
          <div style={{ fontSize: 11 }}>Made with 💧 in India</div>
        </div>
      </div>
    </footer>
  );
};
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [auth, setAuth] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      api
        .get("/auth/me/", savedToken)
        .then((user) => {
          setAuth(user);
          setToken(savedToken);
        })
        .catch(async () => {
          const newToken = await refreshAccessToken();
          if (newToken) {
            api
              .get("/auth/me/", newToken)
              .then((user) => {
                setAuth(user);
                setToken(newToken);
              })
              .catch(() => clearTokens());
          }
        });
    }
  }, []);

  const handleLogin = (user, accessToken) => {
    setAuth(user);
    setToken(accessToken);
  };

  const logout = () => {
    clearTokens();
    setAuth(null);
    setToken(null);
    setPage("home");
  };

  const navigate = (p) => {
    if ((p === "dashboard" || p === "admin") && !auth) {
      setPage("login");
      return;
    }
    setPage(p);
    window.scrollTo && window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={navigate} />;
      case "water":
        return <WaterPage setPage={navigate} />;
      case "air":
        return <AirPage setPage={navigate} />;
      case "brochure":
        return <BrochurePage />;
      case "contact":
        return <ContactPage />;
      case "login":
        return <LoginPage setPage={navigate} onLogin={handleLogin} />;
      case "register":
        return <RegisterPage setPage={navigate} onLogin={handleLogin} />;
      case "dashboard":
        return auth ? (
          <UserDashboard auth={auth} token={token} setPage={navigate} />
        ) : (
          <LoginPage setPage={navigate} onLogin={handleLogin} />
        );
      case "admin":
        return auth?.role === "admin" ? (
          <AdminPanel auth={auth} token={token} setPage={navigate} />
        ) : (
          <LoginPage setPage={navigate} onLogin={handleLogin} />
        );
      default:
        return <HomePage setPage={navigate} />;
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        minHeight: "100vh",
        background: C.bg,
      }}
    >
      <GlobalStyles />
      <Navbar page={page} setPage={navigate} auth={auth} logout={logout} />
      {renderPage()}
      {page !== "admin" && <Footer setPage={navigate} />}
    </div>
  );
}
