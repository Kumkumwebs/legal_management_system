import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Route Map ───────────────────────────────────────────────────────────────
const PAGE_ROUTES = {
  home:    "/",
  about:   "/about",
  contact: "/contact",
  faq:     "/faq",
  privacy: "/privacy-policy",
  terms:   "/terms",
};

const ROUTE_TO_PAGE = {
  "/":              "home",
  "/about":         "about",
  "/contact":       "contact",
  "/faq":           "faq",
  "/privacy-policy":"privacy",
  "/terms":         "terms",
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",       page: "home" },
  { label: "About Us",   page: "about" },
  { label: "Contact Us", page: "contact" },
];

const FOOTER_LINKS = [
  { label: "Privacy Policy",    page: "privacy" },
  { label: "Terms & Conditions",page: "terms" },
  { label: "FAQ",               page: "faq" },
];

const TEAM = [
  {
    name: "Naresh Kumar",
    role: "CMO & Co-Founder",
    initials: "NK",
    color: "#1a3c5e",
    img: "/team/naresh_kumar.jpeg",
    bio: "Marketing and growth strategist leading brand expansion, client engagement, and business development at NTS Online Services OPC Pvt Ltd.",
    linkedin: "#", twitter: "#",
  },
   {
    name: "Rohit Kushwaha",
    role: "CTO ",
    initials: "RK",
    color: "#0f6e56",
    img: "/team/technical1.png",
    bio: "Technology leader driving innovation, platform development, security, and scalable digital solutions at NTS Online Services OPC Pvt Ltd.",
    linkedin: "#", twitter: "#",
  },
  {
    name:"Kumkum Maurya",
    role: "CFO",
    initials: "KM",
    color: "#533ab7",
    img: "/team/technical2.png",
    bio: "Financial leader managing strategy, budgeting, compliance, and business growth at NTS Online Services OPC Pvt Ltd.",
    linkedin: "#", twitter: "#",
  },
 
  
];

const FEATURES = [
  { icon: "⚖️", title: "Case Management",    desc: "Streamline your entire case lifecycle from filing to verdict with intelligent tracking and automated reminders." },
  { icon: "📄", title: "Document Automation", desc: "Generate court-ready legal documents in seconds using our smart templates built for High Court standards." },
  { icon: "🔍", title: "Legal Research",      desc: "Access an extensive database of judgments, statutes, and precedents curated specifically for NTS online services opc pvt LTD." },
  { icon: "📅", title: "Hearing Scheduler",   desc: "Never miss a hearing. Smart calendar sync with automated notifications for all your court dates." },
  { icon: "💼", title: "Client Portal",       desc: "Give clients real-time case updates and secure document sharing through a dedicated portal." },
  { icon: "📊", title: "Analytics Dashboard", desc: "Gain insights into your practice with detailed reports on case outcomes, time tracking, and billing." },
];

const FAQS = [
  { q: "What is NTS online services opc pvt LTD software?",   a: "NTS online services opc pvt LTD is a comprehensive legal software platform developed by NTS online services opc pvt LTD, designed to help lawyers practice more efficiently at Himachal Pradesh High Court." },
  { q: "Who can use this software?",         a: "Our platform is specifically designed for advocates, law firms, and legal professionals practicing at the Himachal Pradesh High Court." },
  { q: "Is my data secure?",                 a: "Absolutely. We use enterprise-grade encryption and comply with all Indian data protection regulations to keep your case data and client information safe." },
  { q: "Can I access it on mobile?",         a: "Yes! NTS online services opc pvt LTD is fully responsive and works seamlessly on desktops, tablets, and smartphones." },
  { q: "Is there a free trial available?",   a: "Yes, we offer a 14-day free trial with full access to all features. No credit card required." },
  { q: "How do I get support?",              a: "We provide 24/7 support via email, phone, and live chat. Our dedicated legal tech specialists are always ready to help." },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── RevealSection ────────────────────────────────────────────────────────────
function RevealSection({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ currentPage, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (page) => {
    navigate(page);
    setMenuOpen(false);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,22,40,0.97)" : "rgba(10,22,40,0.85)",
      backdropFilter: "blur(14px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      transition: "background 0.4s, border 0.4s",
      padding: "0 5vw",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

        {/* Logo */}
        <div onClick={() => go("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "linear-gradient(135deg, #c9a44e 0%, #e8c97a 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#0a1628",
            boxShadow: "0 2px 12px rgba(201,164,78,0.4)",
          }}>⚖</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: 0.5, fontFamily: "'Georgia', serif" }}>NTS online services opc pvt LTD</div>
            <div style={{ color: "#c9a44e", fontSize: 11, letterSpacing: 1, fontFamily: "sans-serif", opacity: 0.85 }}>NTS online services opc pvt LTD.</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hp-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {NAV_LINKS.map(l => (
            <button key={l.page} onClick={() => go(l.page)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: currentPage === l.page ? "#c9a44e" : "rgba(255,255,255,0.78)",
              fontWeight: currentPage === l.page ? 600 : 400,
              fontSize: 15, padding: "8px 16px", borderRadius: 8,
              transition: "color 0.2s",
              fontFamily: "sans-serif",
              borderBottom: currentPage === l.page ? "2px solid #c9a44e" : "2px solid transparent",
            }}>{l.label}</button>
          ))}
          <button onClick={() => navigate("/login")} style={{
            background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
            border: "none", borderRadius: 8, padding: "9px 22px",
            color: "#0a1628", fontWeight: 700, fontSize: 15, cursor: "pointer",
            marginLeft: 12, transition: "transform 0.2s, box-shadow 0.2s",
            fontFamily: "sans-serif",
            boxShadow: "0 2px 12px rgba(201,164,78,0.35)",
          }}
            onMouseOver={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,164,78,0.5)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(201,164,78,0.35)"; }}>
            Login →
          </button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="hp-hamburger" style={{
          display: "none", background: "none", border: "none", cursor: "pointer",
          color: "#fff", fontSize: 26, padding: 6,
        }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: "rgba(10,22,40,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 5vw 20px",
        }}>
          {NAV_LINKS.map(l => (
            <button key={l.page} onClick={() => go(l.page)} style={{
              display: "block", width: "100%", background: "none", border: "none",
              color: currentPage === l.page ? "#c9a44e" : "rgba(255,255,255,0.78)",
              fontWeight: currentPage === l.page ? 600 : 400,
              fontSize: 16, padding: "12px 0", textAlign: "left",
              cursor: "pointer", fontFamily: "sans-serif",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>{l.label}</button>
          ))}
          <button onClick={() => { navigate("/login"); setMenuOpen(false); }} style={{
            display: "block", width: "100%", marginTop: 14,
            background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
            border: "none", borderRadius: 8, padding: "12px",
            color: "#0a1628", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "sans-serif",
          }}>Login →</button>
        </div>
      )}
    </nav>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0d2044 60%, #1a3c5e 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", padding: "100px 5vw 60px",
      }}>
        {/* Decorative rings */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          border: "1px solid rgba(201,164,78,0.08)", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", pointerEvents: "none",
          animation: "hp_pulseRing 4s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          border: "1px solid rgba(201,164,78,0.12)", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", pointerEvents: "none",
          animation: "hp_pulseRing 4s ease-in-out infinite 1s",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "10%", width: 200, height: 200,
          background: "radial-gradient(circle, rgba(201,164,78,0.08) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block", background: "rgba(201,164,78,0.12)",
            border: "1px solid rgba(201,164,78,0.3)", borderRadius: 50,
            padding: "8px 22px", color: "#c9a44e", fontSize: 13, letterSpacing: 1.5,
            fontFamily: "sans-serif", textTransform: "uppercase", marginBottom: 28,
            animation: "hp_fadeSlideDown 0.8s ease both",
          }}>NTS online services opc pvt LTD</div>

          <h1 style={{
            color: "#fff", fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 700, lineHeight: 1.12,
            margin: "0 0 24px", animation: "hp_fadeSlideDown 0.8s ease 0.1s both",
          }}>
            Legal Software Built<br />
            <span style={{ color: "#c9a44e" }}>for NTS online services opc pvt LTD</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.62)", fontSize: "clamp(16px, 2.5vw, 20px)",
            maxWidth: 580, margin: "0 auto 44px", lineHeight: 1.7, fontFamily: "sans-serif",
            animation: "hp_fadeSlideDown 0.8s ease 0.2s both",
          }}>
            Empowering advocates with intelligent case management, document automation, and legal research tools — purpose-built for Himachal Pradesh High Court.
          </p>

          <div style={{
            display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
            animation: "hp_fadeSlideDown 0.8s ease 0.3s both",
          }}>
            <button onClick={() => navigate("/login")} style={{
              background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
              border: "none", borderRadius: 10, padding: "14px 32px",
              color: "#0a1628", fontWeight: 700, fontSize: 16, cursor: "pointer",
              fontFamily: "sans-serif", boxShadow: "0 4px 24px rgba(201,164,78,0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,164,78,0.55)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(201,164,78,0.4)"; }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate("/contact")} style={{
              background: "transparent", border: "1.5px solid rgba(201,164,78,0.45)",
              borderRadius: 10, padding: "14px 32px", color: "#c9a44e",
              fontWeight: 600, fontSize: 16, cursor: "pointer", fontFamily: "sans-serif",
              transition: "background 0.2s, border-color 0.2s",
            }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(201,164,78,0.08)"; e.currentTarget.style.borderColor = "#c9a44e"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(201,164,78,0.45)"; }}>
              Contact Us
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 20, marginTop: 72, animation: "hp_fadeSlideDown 0.8s ease 0.4s both",
          }}>
            {[["500+", "Active Lawyers"], ["98%", "Uptime SLA"], ["10k+", "Cases Managed"], ["4.9★", "User Rating"]].map(([val, lbl]) => (
              <div key={lbl} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "20px 16px", textAlign: "center",
              }}>
                <div style={{ color: "#c9a44e", fontSize: 28, fontWeight: 700, fontFamily: "'Georgia', serif" }}>{val}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4, fontFamily: "sans-serif" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "#f8f6f1", padding: "100px 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 14 }}>WHAT WE OFFER</div>
              <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, margin: 0 }}>
                Everything a Lawyer Needs
              </h2>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {FEATURES.map((f, i) => (
              <RevealSection key={f.title} delay={i * 80}>
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "36px 28px",
                  border: "1px solid rgba(10,22,40,0.07)", height: "100%",
                  transition: "transform 0.25s, box-shadow 0.25s", cursor: "default",
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(10,22,40,0.12)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ fontSize: 36, marginBottom: 18 }}>{f.icon}</div>
                  <h3 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 20, margin: "0 0 12px" }}>{f.title}</h3>
                  <p style={{ color: "#5a6a7a", fontSize: 15, lineHeight: 1.7, margin: 0, fontFamily: "sans-serif" }}>{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a1628, #1a3c5e)", padding: "80px 5vw", textAlign: "center" }}>
        <RevealSection>
          <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "clamp(26px, 4vw, 44px)", margin: "0 0 16px" }}>
            Ready to Transform Your Practice?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 18, margin: "0 0 36px", fontFamily: "sans-serif" }}>
            Join hundreds of advocates already using NTS online services opc pvt LTD software.
          </p>
          <button onClick={() => navigate("/login")} style={{
            background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
            border: "none", borderRadius: 10, padding: "15px 38px",
            color: "#0a1628", fontWeight: 700, fontSize: 17, cursor: "pointer",
            fontFamily: "sans-serif", boxShadow: "0 4px 24px rgba(201,164,78,0.4)",
          }}>Get Started Today</button>
        </RevealSection>
      </section>

      {/* Team Preview */}
      <section style={{ background: "#f8f6f1", padding: "100px 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 14 }}>THE TEAM</div>
              <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, margin: 0 }}>Meet Our Experts</h2>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {TEAM.map((m, i) => (
              <RevealSection key={m.name} delay={i * 80}>
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "28px 20px",
                  textAlign: "center", border: "1px solid rgba(10,22,40,0.07)",
                  transition: "transform 0.25s, box-shadow 0.25s", overflow: "hidden",
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(10,22,40,0.1)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 16px" }}>
                    <img src={m.img} alt={m.name} style={{
                      width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
                      border: `3px solid ${m.color}`, display: "block",
                      boxShadow: `0 4px 16px ${m.color}44`,
                    }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%", background: m.color,
                      alignItems: "center", justifyContent: "center", color: "#fff",
                      fontSize: 24, fontWeight: 700, display: "none",
                      position: "absolute", top: 0, left: 0, fontFamily: "sans-serif",
                    }}>{m.initials}</div>
                  </div>
                  <div style={{ color: "#0a1628", fontWeight: 700, fontSize: 16, fontFamily: "'Georgia', serif" }}>{m.name}</div>
                  <div style={{ color: "#c9a44e", fontSize: 13, marginTop: 6, fontFamily: "sans-serif" }}>{m.role}</div>
                </div>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={200}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <button onClick={() => navigate("/about")} style={{
                background: "transparent", border: "1.5px solid #c9a44e",
                borderRadius: 10, padding: "12px 30px", color: "#c9a44e",
                fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "sans-serif",
                transition: "background 0.2s",
              }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(201,164,78,0.08)"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                Meet the Full Team →
              </button>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────
function AboutPage({ navigate }) {
  return (
    <div>
      <section style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0d2044 70%, #1a3c5e 100%)",
        padding: "90px 5vw 80px", textAlign: "center",
      }}>
        <RevealSection>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 16 }}>WHO WE ARE</div>
            <h1 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "clamp(30px, 5vw, 56px)", margin: "0 0 20px" }}>About NTS online services opc pvt LTD</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.8, fontFamily: "sans-serif" }}>
              A pioneering legal technology company committed to modernizing the legal ecosystem for practitioners at Himachal Pradesh High Court.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* Story */}
      <section style={{ background: "#fff", padding: "90px 5vw" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 60, alignItems: "center" }}>
          <RevealSection>
            <div>
              <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 14 }}>OUR STORY</div>
              <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: "clamp(24px, 3vw, 38px)", margin: "0 0 20px" }}>Born from a Legal Need</h2>
              <p style={{ color: "#5a6a7a", fontSize: 16, lineHeight: 1.8, fontFamily: "sans-serif", margin: "0 0 16px" }}>
                Founded under NTS online services opc pvt LTD, NTS online services opc pvt LTD software was created after observing the immense administrative burden placed on legal professionals in Himachal Pradesh.
              </p>
              <p style={{ color: "#5a6a7a", fontSize: 16, lineHeight: 1.8, fontFamily: "sans-serif", margin: 0 }}>
                Our team of legal experts and technologists joined forces to build a solution that speaks the language of the courtroom while harnessing the power of modern technology.
              </p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["2020", "Founded"], ["500+", "Lawyers Served"], ["HP", "High Court Focus"], ["24/7", "Support"]].map(([v, l]) => (
                <div key={l} style={{ background: "#f8f6f1", borderRadius: 14, padding: "28px 20px", textAlign: "center" }}>
                  <div style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 30, fontWeight: 700 }}>{v}</div>
                  <div style={{ color: "#c9a44e", fontSize: 13, marginTop: 6, fontFamily: "sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: "#f8f6f1", padding: "90px 5vw" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: "clamp(24px, 3vw, 38px)", margin: 0 }}>Our Mission & Values</h2>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { icon: "🎯", title: "Mission",    text: "To make legal practice at NTS online services opc pvt LTD more efficient, transparent, and accessible through innovative software." },
              { icon: "👁️", title: "Vision",     text: "A future where every advocate in Himachal Pradesh has world-class legal technology at their fingertips." },
              { icon: "🤝", title: "Integrity",  text: "Every feature is designed with legal ethics and client confidentiality at its core." },
              { icon: "💡", title: "Innovation", text: "We continuously evolve, leveraging AI and automation to stay ahead of the legal technology curve." },
            ].map((v, i) => (
              <RevealSection key={v.title} delay={i * 80}>
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "32px 24px",
                  border: "1px solid rgba(10,22,40,0.07)", height: "100%",
                  transition: "transform 0.25s, box-shadow 0.25s",
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(10,22,40,0.1)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 20, margin: "0 0 12px" }}>{v.title}</h3>
                  <p style={{ color: "#5a6a7a", fontSize: 15, lineHeight: 1.7, margin: 0, fontFamily: "sans-serif" }}>{v.text}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Full Team */}
      <section style={{ background: "#fff", padding: "90px 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 14 }}>THE PEOPLE</div>
              <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: "clamp(24px, 3vw, 38px)", margin: 0 }}>Meet the Team</h2>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {TEAM.map((m, i) => (
              <RevealSection key={m.name} delay={i * 80}>
                <div style={{
                  background: "#f8f6f1", borderRadius: 20, overflow: "hidden",
                  border: "1px solid rgba(10,22,40,0.07)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 56px rgba(10,22,40,0.13)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  {/* Color bar */}
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${m.color}, ${m.color}88)` }} />
                  <div style={{ padding: "28px 28px 24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                    {/* Photo */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img src={m.img} alt={m.name} style={{
                        width: 88, height: 88, borderRadius: "50%", objectFit: "cover",
                        border: `3px solid ${m.color}`, display: "block",
                        boxShadow: `0 4px 20px ${m.color}44`,
                      }}
                        onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      <div style={{
                        width: 88, height: 88, borderRadius: "50%", background: m.color,
                        alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 28, fontWeight: 700, display: "none",
                        position: "absolute", top: 0, left: 0, fontFamily: "sans-serif",
                      }}>{m.initials}</div>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#0a1628", fontWeight: 700, fontSize: 18, fontFamily: "'Georgia', serif", marginBottom: 4 }}>{m.name}</div>
                      <div style={{
                        display: "inline-block", background: `${m.color}18`,
                        color: m.color, fontSize: 12, fontFamily: "sans-serif",
                        padding: "4px 12px", borderRadius: 50, fontWeight: 600,
                        letterSpacing: 0.4, marginBottom: 12,
                      }}>{m.role}</div>
                      <p style={{ color: "#6a7a8a", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px", fontFamily: "sans-serif" }}>{m.bio}</p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <a href={m.linkedin} style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 34, height: 34, borderRadius: 8, background: "#0a1628",
                          color: "#fff", fontSize: 14, textDecoration: "none",
                          transition: "background 0.2s", fontFamily: "sans-serif", fontWeight: 700,
                        }}
                          onMouseOver={e => e.currentTarget.style.background = m.color}
                          onMouseOut={e => e.currentTarget.style.background = "#0a1628"}>in</a>
                        <a href={m.twitter} style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 34, height: 34, borderRadius: 8, background: "#0a1628",
                          color: "#fff", fontSize: 14, textDecoration: "none",
                          transition: "background 0.2s", fontFamily: "sans-serif",
                        }}
                          onMouseOver={e => e.currentTarget.style.background = m.color}
                          onMouseOut={e => e.currentTarget.style.background = "#0a1628"}>𝕏</a>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setSent(true);
  };

  return (
    <div>
      <section style={{
        background: "linear-gradient(135deg, #0a1628, #0d2044 70%, #1a3c5e)",
        padding: "90px 5vw 80px", textAlign: "center",
      }}>
        <RevealSection>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 16 }}>REACH OUT</div>
            <h1 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "clamp(30px, 5vw, 56px)", margin: "0 0 16px" }}>Contact Us</h1>
            <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 18, lineHeight: 1.7, fontFamily: "sans-serif" }}>
              Our team is ready to assist you. Reach out and we'll respond within 24 hours.
            </p>
          </div>
        </RevealSection>
      </section>

      <section style={{ background: "#f8f6f1", padding: "90px 5vw" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "start" }}>
          <RevealSection>
            <div>
              <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 30, margin: "0 0 30px" }}>Get in Touch</h2>
              {[
                { icon: "📍", label: "Address", val: "Dhiman Niwas, Below BCS Phase 3,New Shimla - 171009" },
                { icon: "📧", label: "Email",   val: "support@hphighcourt.in" },
                { icon: "📞", label: "Phone",   val: " 01773136871" },
                { icon: "🕒", label: "Hours",   val: "Mon–Sat: 9:00 AM – 6:00 PM IST" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: "rgba(201,164,78,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ color: "#c9a44e", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ color: "#0a1628", fontSize: 15, fontFamily: "sans-serif", lineHeight: 1.5 }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection delay={150}>
            <div style={{ background: "#fff", borderRadius: 18, padding: "40px 32px", border: "1px solid rgba(10,22,40,0.07)" }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
                  <h3 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 24, margin: "0 0 12px" }}>Message Sent!</h3>
                  <p style={{ color: "#5a6a7a", fontFamily: "sans-serif", fontSize: 16 }}>We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }} style={{
                    marginTop: 20, background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
                    border: "none", borderRadius: 8, padding: "10px 24px",
                    color: "#0a1628", fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif",
                  }}>Send Another</button>
                </div>
              ) : (
                <>
                  <h3 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 22, margin: "0 0 24px" }}>Send a Message</h3>
                  {[
                    { key: "name",  label: "Full Name *",      type: "text",  placeholder: "Advocate Ramesh Kumar" },
                    { key: "email", label: "Email Address *",  type: "email", placeholder: "advocate@example.com" },
                    { key: "phone", label: "Phone Number",     type: "tel",   placeholder: " 01773136871" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 18 }}>
                      <label style={{ display: "block", color: "#5a6a7a", fontSize: 13, marginBottom: 6, fontFamily: "sans-serif", letterSpacing: 0.5 }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{
                          width: "100%", padding: "12px 14px", border: "1.5px solid #e0ddd6",
                          borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "sans-serif",
                          boxSizing: "border-box", transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "#c9a44e"}
                        onBlur={e => e.target.style.borderColor = "#e0ddd6"}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", color: "#5a6a7a", fontSize: 13, marginBottom: 6, fontFamily: "sans-serif", letterSpacing: 0.5 }}>Message *</label>
                    <textarea
                      placeholder="Tell us how we can help you..."
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      rows={5}
                      style={{
                        width: "100%", padding: "12px 14px", border: "1.5px solid #e0ddd6",
                        borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "sans-serif",
                        resize: "vertical", boxSizing: "border-box", transition: "border-color 0.2s",
                      }}
                      onFocus={e => e.target.style.borderColor = "#c9a44e"}
                      onBlur={e => e.target.style.borderColor = "#e0ddd6"}
                    />
                  </div>
                  <button onClick={handleSubmit} style={{
                    width: "100%", background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
                    border: "none", borderRadius: 10, padding: "14px",
                    color: "#0a1628", fontWeight: 700, fontSize: 16, cursor: "pointer",
                    fontFamily: "sans-serif",
                  }}>Send Message →</button>
                </>
              )}
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

// ─── FAQ Page ─────────────────────────────────────────────────────────────────
function FAQPage() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <section style={{
        background: "linear-gradient(135deg, #0a1628, #0d2044 70%, #1a3c5e)",
        padding: "90px 5vw 80px", textAlign: "center",
      }}>
        <RevealSection>
          <div style={{ color: "#c9a44e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 16 }}>FAQs</div>
          <h1 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "clamp(30px, 5vw, 56px)", margin: "0 0 16px" }}>Frequently Asked Questions</h1>
          <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 18, fontFamily: "sans-serif" }}>Everything you need to know about NTS online services opc pvt LTD software.</p>
        </RevealSection>
      </section>
      <section style={{ background: "#f8f6f1", padding: "90px 5vw" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {FAQS.map((faq, i) => (
            <RevealSection key={i} delay={i * 60}>
              <div style={{
                background: "#fff", borderRadius: 14, marginBottom: 14,
                border: "1px solid rgba(10,22,40,0.07)", overflow: "hidden",
              }}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{
                  width: "100%", background: "none", border: "none",
                  padding: "22px 24px", textAlign: "left", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                }}>
                  <span style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 17, fontWeight: 600 }}>{faq.q}</span>
                  <span style={{
                    color: "#c9a44e", fontSize: 22, flexShrink: 0,
                    transform: open === i ? "rotate(45deg)" : "rotate(0)",
                    transition: "transform 0.3s", display: "inline-block",
                  }}>+</span>
                </button>
                <div style={{
                  maxHeight: open === i ? 200 : 0, overflow: "hidden",
                  transition: "max-height 0.35s ease",
                }}>
                  <p style={{ color: "#5a6a7a", fontSize: 15, lineHeight: 1.8, margin: 0, padding: "0 24px 22px", fontFamily: "sans-serif" }}>{faq.a}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Policy / Terms Page ──────────────────────────────────────────────────────
function SimplePage({ title, subtitle, children }) {
  return (
    <div>
      <section style={{
        background: "linear-gradient(135deg, #0a1628, #0d2044 70%, #1a3c5e)",
        padding: "90px 5vw 80px", textAlign: "center",
      }}>
        <RevealSection>
          <h1 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "clamp(30px, 5vw, 56px)", margin: "0 0 16px" }}>{title}</h1>
          <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 18, fontFamily: "sans-serif" }}>{subtitle}</p>
        </RevealSection>
      </section>
      <section style={{ background: "#f8f6f1", padding: "80px 5vw" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 18, padding: "48px", border: "1px solid rgba(10,22,40,0.07)" }}>
          {children}
        </div>
      </section>
    </div>
  );
}

function PolicyText({ sections }) {
  return sections.map(s => (
    <div key={s.heading} style={{ marginBottom: 32 }}>
      <h2 style={{ color: "#0a1628", fontFamily: "'Georgia', serif", fontSize: 20, margin: "0 0 12px" }}>{s.heading}</h2>
      <p style={{ color: "#5a6a7a", fontSize: 15, lineHeight: 1.9, margin: 0, fontFamily: "sans-serif" }}>{s.text}</p>
    </div>
  ));
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer style={{ background: "#060e1c", color: "rgba(255,255,255,0.55)", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 5vw 30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, #c9a44e, #e8c97a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#0a1628", fontWeight: 800,
              }}>⚖</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Georgia', serif" }}></div>
                <div style={{ color: "#c9a44e", fontSize: 11, letterSpacing: 0.8 }}>NTS online services opc pvt LTD.</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              Legal software solutions crafted specifically for advocates at the Himachal Pradesh High Court.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 16, letterSpacing: 0.5 }}>NAVIGATION</div>
            {NAV_LINKS.map(l => (
              <div key={l.page} style={{ marginBottom: 10 }}>
                <button onClick={() => navigate(l.page)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.55)",
                  cursor: "pointer", fontSize: 14, padding: 0, fontFamily: "sans-serif",
                  transition: "color 0.2s",
                }}
                  onMouseOver={e => e.target.style.color = "#c9a44e"}
                  onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
                  {l.label}
                </button>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 16, letterSpacing: 0.5 }}>LEGAL</div>
            {FOOTER_LINKS.map(l => (
              <div key={l.page} style={{ marginBottom: 10 }}>
                <button onClick={() => navigate(l.page)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.55)",
                  cursor: "pointer", fontSize: 14, padding: 0, fontFamily: "sans-serif",
                  transition: "color 0.2s",
                }}
                  onMouseOver={e => e.target.style.color = "#c9a44e"}
                  onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
                  {l.label}
                </button>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 16, letterSpacing: 0.5 }}>CONTACT</div>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: "0 0 10px" }}>support@hphighcourt.in</p>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: "0 0 10px" }}> 01773136871</p>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>Dhiman Niwas, Below BCS Phase 3,
New Shimla - 171009</p>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24,
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <p style={{ fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} NTS online services opc pvt LTD. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {FOOTER_LINKS.map(l => (
              <button key={l.page} onClick={() => navigate(l.page)} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "sans-serif",
                transition: "color 0.2s",
              }}
                onMouseOver={e => e.target.style.color = "#c9a44e"}
                onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.4)"}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function HPHighCourt({ initialPage = "home" }) {
  const reactNavigate = useNavigate();
  const location      = useLocation();

  // Sync page state from current URL
  const pageFromUrl = ROUTE_TO_PAGE[location.pathname] || "home";
  const [page, setPage] = useState(pageFromUrl);

  // Keep page in sync when user hits browser Back / Forward
  useEffect(() => {
    const p = ROUTE_TO_PAGE[location.pathname] || "home";
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Central navigation function passed to all child components
  const navigate = (pageKey) => {
    if (pageKey === "/login") {
      reactNavigate("/login");
      return;
    }
    const route = PAGE_ROUTES[pageKey] || "/";
    setPage(pageKey);
    reactNavigate(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home":    return <HomePage    navigate={navigate} />;
      case "about":   return <AboutPage   navigate={navigate} />;
      case "contact": return <ContactPage navigate={navigate} />;
      case "faq":     return <FAQPage />;
      case "privacy": return (
        <SimplePage title="Privacy Policy" subtitle="Last updated: January 2024">
          <PolicyText sections={[
            { heading: "1. Information We Collect",      text: "We collect information you provide when registering, including your name, email address, bar enrollment number, and professional details. We also collect usage data to improve our platform." },
            { heading: "2. How We Use Your Information", text: "Your information is used solely to provide and improve our services. We never sell personal data to third parties. Case data and client information is kept strictly confidential in accordance with Indian bar council regulations." },
            { heading: "3. Data Security",               text: "We employ industry-standard AES-256 encryption for all data at rest and in transit. Our servers are hosted in Indian data centers compliant with IT Act, 2000 requirements." },
            { heading: "4. Your Rights",                 text: "You have the right to access, correct, or delete your personal information at any time. Contact our data protection officer at privacy@hphighcourt.in to exercise these rights." },
            { heading: "5. Cookies",                     text: "We use essential cookies to maintain your session and preferences. We do not use advertising or tracking cookies. You can manage cookie preferences through your browser settings." },
            { heading: "6. Contact Us",                  text: "For any privacy-related concerns, contact NTS online services opc pvt LTD at privacy@hphighcourt.in or write to our registered office in Shimla, Himachal Pradesh." },
          ]} />
        </SimplePage>
      );
      case "terms": return (
        <SimplePage title="Terms & Conditions" subtitle="Please read these terms carefully before using our services">
          <PolicyText sections={[
            { heading: "1. Acceptance of Terms",      text: "By accessing NTS online services opc pvt LTD software, you agree to be bound by these Terms and Conditions and all applicable laws. If you do not agree with any part of these terms, you may not use our services." },
            { heading: "2. Subscription & Payment",   text: "Access to premium features requires a valid subscription. Fees are billed monthly or annually as chosen. Refunds are available within 7 days of purchase if the software does not meet advertised functionality." },
            { heading: "3. Acceptable Use",           text: "The software may only be used for lawful legal practice purposes. Users must be enrolled advocates or authorized legal staff. Any misuse, including unauthorized access or data mining, will result in immediate account termination." },
            { heading: "4. Intellectual Property",    text: "All software, content, and materials on this platform are the exclusive property of NTS online services opc pvt LTD and are protected under Indian copyright laws. Unauthorized reproduction is prohibited." },
            { heading: "5. Limitation of Liability",  text: "NTS online services opc pvt LTD software is a practice management tool. It does not constitute legal advice. NTS online services opc pvt LTD is not liable for any legal outcomes based on information or documents generated through our platform." },
            { heading: "6. Governing Law",            text: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Shimla, Himachal Pradesh." },
          ]} />
        </SimplePage>
      );
      default: return <HomePage navigate={navigate} />;
    }
  };

  return createPortal(
    <>
      <style>{`
        body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }

        .hp-portal-root {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          width: 100vw !important; height: 100vh !important;
          z-index: 99999 !important;
          overflow-y: auto !important; overflow-x: hidden !important;
          background: #fff;
          margin: 0 !important; padding: 0 !important;
        }
        .hp-portal-root *, .hp-portal-root *::before, .hp-portal-root *::after {
          box-sizing: border-box;
        }
        @keyframes hp_fadeSlideDown {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hp_pulseRing {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 0.8; transform: translate(-50%,-50%) scale(1.04); }
        }
        @media (max-width: 768px) {
          .hp-desktop-nav { display: none !important; }
          .hp-hamburger   { display: block !important; }
        }
        @media (min-width: 769px) {
          .hp-hamburger { display: none !important; }
        }
        .hp-portal-root input:focus,
        .hp-portal-root textarea:focus { outline: none; }
        .hp-portal-root button { font-family: inherit; }
        .hp-portal-root a      { text-decoration: none; }
        .hp-portal-root section {
          width: 100% !important;
          margin-left: 0 !important; margin-right: 0 !important;
        }
      `}</style>
      <div className="hp-portal-root">
        <Navbar currentPage={page} navigate={navigate} />
        <main style={{ paddingTop: 68, width: "100%", margin: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
          {renderPage()}
        </main>
        <Footer navigate={navigate} />
      </div>
    </>,
    document.body
  );
}