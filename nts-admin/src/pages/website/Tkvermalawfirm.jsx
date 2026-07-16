import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   DESIGN DIRECTION: Institutional · Authoritative · Restrained
   Palette: Ivory white · Charcoal · Single warm gold accent
   Typography: Libre Baskerville (serif authority) + DM Sans (clean legibility)
   Mood: A senior advocate's chambers — gravitas, trust, precision
───────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

:root {
  --ivory:   #f7f5f0;
  --white:   #ffffff;
  --stone:   #f0ede6;
  --border:  #ddd9d0;
  --muted:   #8a8278;
  --body:    #3d3830;
  --heading: #1c1814;
  --gold:    #9a7c3a;
  --gold-lt: #c4a45a;
  --gold-bg: rgba(154,124,58,0.07);
  --navy:    #1e2535;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body { background: var(--white); color: var(--body); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
::selection { background: var(--gold); color: #fff; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--stone); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Reveal */
.rv  { opacity:0; transform:translateY(28px); transition:opacity .75s ease, transform .75s ease; }
.rvl { opacity:0; transform:translateX(-32px); transition:opacity .75s ease, transform .75s ease; }
.rvr { opacity:0; transform:translateX(32px); transition:opacity .75s ease, transform .75s ease; }
.rv.in, .rvl.in, .rvr.in { opacity:1; transform:none; }

/* Hover states */
.card { transition: box-shadow .25s ease, border-color .25s ease; }
.card:hover { border-color: var(--gold) !important; box-shadow: 0 8px 32px rgba(0,0,0,.08) !important; }
.btn-gold { transition: all .22s ease; }
.btn-gold:hover { background: #7a6028 !important; }
.btn-outline { transition: all .22s ease; }
.btn-outline:hover { background: var(--gold-bg) !important; border-color: var(--gold) !important; color: var(--gold) !important; }
.nav-link { transition: color .18s ease; }
.nav-link:hover { color: var(--gold) !important; }
.nav-link.active { color: var(--heading) !important; font-weight: 600; }
input:focus, textarea:focus, select:focus {
  outline: none !important; border-color: var(--gold) !important;
  box-shadow: 0 0 0 3px rgba(154,124,58,.1) !important;
}
a { transition: color .18s ease; }

/* Keyframes */
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes blink    { 0%,50%{opacity:1} 51%,100%{opacity:0} }
@keyframes barGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes modalIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }

/* Responsive */
@media(max-width:900px){
  .two-col { grid-template-columns: 1fr !important; }
  .three-col { grid-template-columns: 1fr 1fr !important; }
  .four-col { grid-template-columns: 1fr 1fr !important; }
  .stats-row { grid-template-columns: repeat(2,1fr) !important; }
  .contact-grid { grid-template-columns: 1fr !important; }
  .footer-grid { grid-template-columns: 1fr 1fr !important; }
}
@media(max-width:600px){
  .desktop-only { display:none !important; }
  .mobile-show { display:flex !important; }
  .three-col { grid-template-columns: 1fr !important; }
  .four-col { grid-template-columns: 1fr !important; }
  .stats-row { grid-template-columns: 1fr 1fr !important; }
  .footer-grid { grid-template-columns: 1fr !important; }
  .form-row { grid-template-columns: 1fr !important; }
  .hero-cta { flex-direction: column !important; }
  .hero-cta > * { width: 100% !important; text-align: center !important; }
}
@media(min-width:601px){ .mobile-show { display:none !important; } }
`;

/* ── constants ───────────────────────────────────────── */
const NAV = ["Home", "About", "Our Team", "Practice", "Contact"];

const TEAM = [
  {
    name: "T.K. Verma",
    role: "Principal Advocate",
    qual: "B.A. LLB (Hons.) · LLM",
    exp: "30+ Years",
    focus: ["Civil Litigation", "Criminal Defence", "Constitutional Law"],
    img: "public/team/team_advocate.jpeg",
    bio: "Enrolled with the Bar Council of Himachal Pradesh since 1992, Advocate T.K. Verma has built a distinguished practice spanning civil, criminal and constitutional law. He appears regularly before the HP High Court and all District Courts of Shimla from Chamber No. 267, HP High Court Complex.",
  },
  {
    name: "Naresh Kumar",
    role: "Associate Advocate",
    qual: "LLB (Hons.) · LLM — Family Law",
    exp: "8 Years",
    focus: ["Family & Matrimonial", "Consumer Law", "Succession"],
    img: "public/team/naresh_kumar.jpeg",
    bio: "Advocate Naresh Kumar specialises in family and matrimonial law, having represented clients in over 200 matters involving divorce, maintenance, child custody and succession. He holds an LLM in Family Law from HP University, Shimla.",
  },
  {
    name: "Akriti Sharma",
    role: "Associate Advocate",
    qual: "LLB · PGDCL",
    exp: "5 Years",
    focus: ["Revenue & Land", "Property Law", "Labour Law"],
    img: "public/team/team_pair.jpeg",
    bio: "Advocate Akriti Sharma focuses on revenue, property and labour matters across Himachal Pradesh courts. She is known for meticulous file preparation, thorough research and clear written arguments.",
  }
];

const PRACTICE = [
  { t: "Civil Litigation", d: "Suits for recovery, injunctions, specific performance, declaratory reliefs and appeals before civil courts at all levels in Himachal Pradesh." },
  { t: "Criminal Defence", d: "Bail applications, trials, appeals and revisions in criminal matters before Magistrate Courts, Sessions Court and the HP High Court." },
  { t: "Property & Real Estate", d: "Title verification, possession suits, mutation disputes, partition proceedings and registration-related litigation throughout HP." },
  { t: "Family & Matrimonial", d: "Divorce, judicial separation, maintenance, child custody, guardianship, adoption and succession under personal laws and special statutes." },
  { t: "Constitutional & Writ", d: "Writ petitions under Article 226, PILs and fundamental rights enforcement before the Hon'ble Himachal Pradesh High Court, Shimla." },
  { t: "Service & Labour", d: "Departmental inquiries, service matter appeals, suspension and termination challenges before courts and administrative tribunals." },
  { t: "Revenue & Land", d: "Jamabandi corrections, demarcation disputes, land acquisition matters and appeals before Revenue Courts across Himachal Pradesh." },
  { t: "Consumer Disputes", d: "Redressal of consumer grievances and insurance claim disputes before District and State Consumer Disputes Redressal Commissions." },
  { t: "Arbitration & Mediation", d: "Alternative dispute resolution including arbitration proceedings and mediation, providing cost-effective resolution outside the courts." },
];

const TESTIMONIALS = [
  { name: "Rajesh Kumar Sharma", matter: "Property Dispute", body: "Advocate Verma handled our multi-party property dispute with thoroughness and composure throughout the proceedings. His command over HP Revenue law and strategic approach at each hearing resulted in a decree entirely in our favour. We are grateful for his steadfast representation." },
  { name: "Priya Thakur", matter: "HP High Court — Writ Petition", body: "Approaching the High Court for the first time was daunting. Advocate Verma explained every step clearly, filed an exceptionally well-researched petition, and secured relief for us well ahead of schedule. His prompt responses to our queries throughout were particularly reassuring." },
  { name: "Anil Kumar Gupta", matter: "Criminal Defence", body: "At the most difficult point in my life, Advocate T.K. Verma stood by me with complete professionalism and commitment. He left nothing unexamined — the cross-examination was precise, the arguments thorough, and the outcome was a full acquittal. I cannot recommend him highly enough." },
  { name: "Suman Devi Thakur", matter: "Matrimonial Matter", body: "Advocate Verma handled my matrimonial case with both sensitivity and firmness. He secured fair maintenance and custody terms and kept me informed at every stage. His calm, measured approach during a very difficult time made all the difference." },
];

/* ── hooks ───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const run = () => {
      document.querySelectorAll(".rv,.rvl,.rvr").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60)
          el.classList.add("in");
      });
    };
    run();
    window.addEventListener("scroll", run, { passive: true });
    return () => window.removeEventListener("scroll", run);
  });
}

/* ── SEO ─────────────────────────────────────────────── */
function SEO() {
  useEffect(() => {
    document.title = "T.K. Verma, Advocate — HP High Court & District Courts, Shimla";
    const tags = [
      { name:"description", content:"T.K. Verma, Advocate — 30+ years of legal practice at HP High Court and District Courts, Shimla. B.A. LLB (Hons.) LLM. Civil, Criminal, Property, Family & Constitutional Law. Chamber 267, HP High Court. Call 94593-48501." },
      { name:"keywords", content:"TK Verma Advocate Shimla, HP High Court Lawyer, Advocate Shimla HP, Property Lawyer Shimla, Criminal Defence HP, Family Law Shimla, Constitutional Lawyer HP, Chamber 267 HP High Court" },
      { name:"robots", content:"index, follow" },
      { property:"og:title", content:"T.K. Verma, Advocate — HP High Court, Shimla" },
      { property:"og:description", content:"30+ years of legal practice at HP High Court, Shimla. Civil, Criminal, Property, Family & Constitutional Law." },
      { property:"og:url", content:"https://tkverma.hphighcourt.com" },
      { property:"og:type", content:"website" },
      { name:"twitter:card", content:"summary_large_image" },
      { name:"geo.region", content:"IN-HP" },
      { name:"geo.placename", content:"Shimla, Himachal Pradesh" },
    ];
    const els = tags.map(m => {
      const el = document.createElement("meta");
      Object.entries(m).forEach(([k,v]) => el.setAttribute(k,v));
      document.head.appendChild(el);
      return el;
    });
    const can = document.createElement("link");
    can.rel = "canonical"; can.href = "https://tkverma.hphighcourt.com";
    document.head.appendChild(can);
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context":"https://schema.org","@type":"LegalService",
      "name":"T.K. Verma, Advocate",
      "url":"https://tkverma.hphighcourt.com",
      "telephone":["+91-94593-48501","+91-80917-99979"],
      "email":"tkadv1992@gmail.com",
      "address":{ "@type":"PostalAddress","streetAddress":"Chamber No. 267, HP High Court Complex",
        "addressLocality":"Shimla","addressRegion":"Himachal Pradesh","postalCode":"171001","addressCountry":"IN" },
      "description":"Experienced advocate at HP High Court & District Courts, Shimla. 30+ years in civil, criminal, property, family and constitutional law.",
      "areaServed":"Himachal Pradesh"
    });
    document.head.appendChild(ld);
    return () => { els.forEach(e=>e.remove()); can.remove(); ld.remove(); };
  }, []);
  return null;
}

/* ── top bar ─────────────────────────────────────────── */
function TopBar() {
  return (
    <div style={{ background:"var(--navy)", padding:"8px clamp(1rem,4vw,3rem)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      flexWrap:"wrap", gap:8, zIndex:300, position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        {[["94593-48501","tel:+919459348501"],["80917-99979","tel:+918091799979"],["tkadv1992@gmail.com","mailto:tkadv1992@gmail.com"]].map(([v,h])=>(
          <a key={v} href={h}
            style={{ color:"rgba(255,255,255,.55)", fontSize:12,
              textDecoration:"none", fontFamily:"'DM Sans',sans-serif", letterSpacing:.2 }}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.55)"}>
            {v}
          </a>
        ))}
      </div>
      <div style={{ color:"rgba(255,255,255,.35)", fontSize:11,
        fontFamily:"'DM Sans',sans-serif", letterSpacing:.3 }}>
        Mon – Sat &nbsp;·&nbsp; 10 AM – 5 PM &nbsp;·&nbsp; tkverma.hphighcourt.com
      </div>
    </div>
  );
}

/* ── login modal ─────────────────────────────────────── */
function LoginModal({ onClose }) {
  const [form, setForm] = useState({ u:"", p:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  const submit = () => {
    if (!form.u || !form.p) { setErr("Please fill all fields."); return; }
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); setErr("Invalid credentials. Please contact the office to obtain access."); }, 1200);
  };
  const inpStyle = (err) => ({
    width:"100%", background:"var(--ivory)", border:`1px solid ${err?"#c0392b":"var(--border)"}`,
    borderRadius:4, padding:"11px 13px", color:"var(--heading)",
    fontSize:14, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box",
  });
  return (
    <div onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(28,24,20,.55)",
        backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center",
        padding:16, animation:"fadeIn .2s ease" }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:400, background:"var(--white)",
          border:"1px solid var(--border)", borderRadius:6,
          boxShadow:"0 24px 60px rgba(0,0,0,.18)", animation:"modalIn .3s ease", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:"var(--navy)", padding:"28px 28px 22px",
          borderBottom:"3px solid var(--gold)", position:"relative" }}>
          <button onClick={onClose}
            style={{ position:"absolute", top:14, right:16, width:28, height:28,
              background:"rgba(255,255,255,.1)", border:"none", borderRadius:3,
              cursor:"pointer", color:"rgba(255,255,255,.6)", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,.18)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.1)"; e.currentTarget.style.color="rgba(255,255,255,.6)"; }}>
            ×
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:36, height:36, borderRadius:3,
              background:"var(--gold)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:16, color:"#fff", fontWeight:700,
              fontFamily:"'Libre Baskerville',serif" }}>⚖</div>
            <div>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
                color:"#fff", fontSize:14, letterSpacing:.5 }}>T.K. Verma, Advocate</div>
              <div style={{ color:"rgba(255,255,255,.4)", fontSize:10,
                letterSpacing:2, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>Client Portal</div>
            </div>
          </div>
          <p style={{ color:"rgba(255,255,255,.45)", fontSize:12,
            fontFamily:"'DM Sans',sans-serif", lineHeight:1.55, fontWeight:300 }}>
            Sign in to access case status, documents and correspondence.
          </p>
        </div>
        {/* Form */}
        <div style={{ padding:"26px 28px 30px" }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, color:"var(--muted)",
              letterSpacing:1, textTransform:"uppercase", marginBottom:6,
              fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Email or Phone</label>
            <input value={form.u} onChange={e=>setForm(p=>({...p,u:e.target.value}))}
              placeholder="Enter email or phone number" style={inpStyle(false)} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:11, color:"var(--muted)",
              letterSpacing:1, textTransform:"uppercase", marginBottom:6,
              fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Password</label>
            <input type="password" value={form.p} onChange={e=>setForm(p=>({...p,p:e.target.value}))}
              placeholder="Enter your password" style={inpStyle(false)} />
          </div>
          {err && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5",
              borderRadius:4, padding:"9px 12px", marginBottom:16,
              color:"#b91c1c", fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>{err}</div>
          )}
          <button onClick={submit} disabled={loading}
            className="btn-gold"
            style={{ width:"100%", background:"var(--navy)", border:"none",
              color:"#fff", padding:"13px", borderRadius:4, cursor:loading?"wait":"pointer",
              fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
              letterSpacing:.3, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            {loading
              ? <><div style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.3)",
                  borderTopColor:"#fff", borderRadius:"50%", animation:"spin .8s linear infinite" }} />Signing in…</>
              : "Sign In"}
          </button>
          <p style={{ textAlign:"center", marginTop:16, fontSize:12,
            color:"var(--muted)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
            Don't have access?{" "}
            <button onClick={onClose}
              style={{ background:"none", border:"none", color:"var(--gold)",
                cursor:"pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif",
                textDecoration:"underline", padding:0 }}>
              Contact the office
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── navbar ──────────────────────────────────────────── */
function Navbar({ active, setActive, onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 30);
      const h = document.body.scrollHeight - window.innerHeight;
      setProg(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const go = n => {
    const id = n.toLowerCase().replace(/\s+/g, "-");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActive(n); setMob(false);
  };
  return (
    <>
      {/* Reading progress */}
      <div style={{ position:"fixed", top:0, left:0, height:2, zIndex:400,
        width:`${prog}%`, background:"var(--gold)", transition:"width .1s", transformOrigin:"left" }} />

      <nav style={{ position:"fixed", top:2, left:0, right:0, zIndex:200,
        background: scrolled ? "rgba(255,255,255,.97)" : "var(--white)",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "var(--border)"}`,
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,.06)" : "none",
        transition:"box-shadow .3s ease", animation:"fadeIn .5s ease" }}>
        <div style={{ maxWidth:1240, margin:"0 auto",
          padding:"0 clamp(1rem,4vw,3rem)",
          display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>

          {/* Logo */}
          <button onClick={()=>go("Home")}
            style={{ background:"none", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, background:"var(--navy)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:17, color:"var(--gold)", fontFamily:"'Libre Baskerville',serif",
              flexShrink:0, borderRadius:2 }}>⚖</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
                fontSize:14, color:"var(--heading)", letterSpacing:.3, lineHeight:1.1 }}>
                T.K. Verma
              </div>
              <div style={{ fontSize:9.5, color:"var(--muted)", letterSpacing:1.5,
                textTransform:"uppercase", marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>
                Advocate · Shimla
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="desktop-only" style={{ display:"flex", alignItems:"center", gap:4 }}>
            {NAV.map(n => (
              <button key={n} className={`nav-link${active===n?" active":""}`}
                onClick={() => go(n)}
                style={{ background:"none", border:"none", cursor:"pointer",
                  padding:"8px 14px", color:active===n?"var(--heading)":"var(--muted)",
                  fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:active===n?600:400,
                  letterSpacing:.2 }}>
                {n}
              </button>
            ))}
            <div style={{ width:1, height:22, background:"var(--border)", margin:"0 8px" }} />
            <button onClick={onLogin} className="btn-outline"
              style={{ background:"none", border:"1px solid var(--border)",
                color:"var(--body)", padding:"7px 16px", borderRadius:3,
                cursor:"pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif",
                fontWeight:500, letterSpacing:.2, display:"flex", alignItems:"center", gap:6 }}>
              Client Login
            </button>
            <button onClick={() => go("Contact")} className="btn-gold"
              style={{ background:"var(--navy)", border:"none", color:"#fff",
                padding:"9px 20px", borderRadius:3, cursor:"pointer",
                fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
                letterSpacing:.2, marginLeft:6 }}>
              Free Consultation
            </button>
          </div>

          {/* Mobile */}
          <button className="mobile-show"
            onClick={() => setMob(o => !o)}
            style={{ background:"none", border:"1px solid var(--border)",
              borderRadius:4, width:38, height:38, cursor:"pointer",
              flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4.5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display:"block", width:18, height:1.5,
                background:"var(--body)", transition:"all .3s",
                transform: mob
                  ? i===0 ? "rotate(45deg) translate(4px,4px)"
                  : i===2 ? "rotate(-45deg) translate(4px,-4px)"
                  : "scaleX(0)" : "none",
                opacity: mob && i===1 ? 0 : 1 }} />
            ))}
          </button>
        </div>

        {mob && (
          <div style={{ background:"var(--white)", borderTop:"1px solid var(--border)",
            padding:"12px 0", animation:"slideUp .25s ease" }}>
            {NAV.map(n => (
              <button key={n} onClick={() => go(n)}
                style={{ display:"block", width:"100%", background:"none", border:"none",
                  cursor:"pointer", color:active===n?"var(--heading)":"var(--muted)",
                  padding:"11px clamp(1rem,5vw,2rem)", textAlign:"left",
                  fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:active===n?600:400,
                  borderBottom:"1px solid var(--stone)" }}>
                {n}
              </button>
            ))}
            <div style={{ padding:"14px clamp(1rem,5vw,2rem)", display:"flex", gap:10 }}>
              <button onClick={() => { onLogin(); setMob(false); }}
                style={{ flex:1, background:"none", border:"1px solid var(--border)",
                  color:"var(--body)", padding:"11px", borderRadius:3,
                  cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
                Client Login
              </button>
              <button onClick={() => go("Contact")} className="btn-gold"
                style={{ flex:2, background:"var(--navy)", border:"none",
                  color:"#fff", padding:"11px", borderRadius:3, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600 }}>
                Free Consultation
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

/* ── section label ───────────────────────────────────── */
function Label({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
      <div style={{ width:28, height:2, background:"var(--gold)", borderRadius:1, flexShrink:0 }} />
      <span style={{ fontSize:11, color:"var(--gold)", letterSpacing:2.5,
        textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
        {children}
      </span>
    </div>
  );
}

/* ── hero ────────────────────────────────────────────── */
function Hero({ setActive }) {
  const [loaded, setLoaded] = useState(false);
  const [ti, setTi] = useState(0);
  const [ci, setCi] = useState(0);
  const types = ["Civil Litigation","Criminal Defence","Property Law","Constitutional Writs","Family Matters","Arbitration"];
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  useEffect(() => {
    if (!loaded) return;
    const cur = types[ti];
    if (ci < cur.length) { const t = setTimeout(() => setCi(c=>c+1), 72); return () => clearTimeout(t); }
    const t2 = setTimeout(() => { setTi(i=>(i+1)%types.length); setCi(0); }, 2500);
    return () => clearTimeout(t2);
  }, [loaded, ci, ti]);

  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <section id="home"
      style={{ background:"var(--ivory)", minHeight:"100vh",
        display:"flex", alignItems:"center", overflow:"hidden", position:"relative" }}>

      {/* Subtle vertical rule */}
      <div style={{ position:"absolute", right:"clamp(80px,15vw,220px)", top:0, bottom:0,
        width:1, background:"var(--border)", opacity:.5 }} />

      <div style={{ maxWidth:1240, margin:"0 auto",
        padding:"120px clamp(1.5rem,5vw,4rem) 80px", width:"100%", position:"relative", zIndex:2 }}>

        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:60, alignItems:"center" }}>

          {/* Left */}
          <div>
            <div style={{ opacity:loaded?1:0, transform:loaded?"none":"translateY(16px)",
              transition:"all .8s ease .05s" }}>
              <Label>Advocate · HP High Court · Shimla</Label>
            </div>

            <h1 style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
              fontSize:"clamp(2.6rem,5.5vw,4.4rem)", color:"var(--heading)",
              lineHeight:1.08, letterSpacing:-.5, marginBottom:10,
              opacity:loaded?1:0, transform:loaded?"none":"translateY(22px)",
              transition:"all .9s ease .15s" }}>
              T.K. Verma
            </h1>

            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(.9rem,1.4vw,1rem)",
              color:"var(--muted)", letterSpacing:1.8, textTransform:"uppercase",
              marginBottom:28, fontWeight:400,
              opacity:loaded?1:0, transition:"all .9s ease .25s" }}>
              B.A. LLB (Hons.) · LLM · Bar Council of Himachal Pradesh
            </p>

            {/* Gold rule */}
            <div style={{ width:48, height:2, background:"var(--gold)", marginBottom:28,
              opacity:loaded?1:0, transition:"opacity .7s ease .35s",
              animation:loaded?"barGrow .6s ease .35s backwards":undefined,
              transformOrigin:"left" }} />

            {/* Typewriter */}
            <div style={{ marginBottom:28, minHeight:26,
              opacity:loaded?1:0, transition:"opacity .8s ease .45s" }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(.9rem,1.4vw,1rem)",
                color:"var(--muted)", fontStyle:"italic" }}>Currently accepting: </span>
              <span style={{ fontFamily:"'Libre Baskerville',serif",
                fontSize:"clamp(.9rem,1.4vw,1rem)", color:"var(--gold)", fontStyle:"italic" }}>
                {types[ti].substring(0, ci)}
                <span style={{ animation:"blink 1s infinite", color:"var(--gold)" }}>|</span>
              </span>
            </div>

            <p style={{ fontFamily:"'DM Sans',sans-serif",
              fontSize:"clamp(.9rem,1.4vw,1.02rem)", color:"var(--body)",
              lineHeight:1.85, maxWidth:560, marginBottom:38, fontWeight:300,
              opacity:loaded?1:0, transition:"all .9s ease .55s" }}>
              Over three decades of distinguished legal practice before the Himachal Pradesh
              High Court and all District Courts of Shimla. Trusted by hundreds of clients
              across civil, criminal, property, constitutional and personal law matters.
            </p>

            <div className="hero-cta"
              style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:44,
                opacity:loaded?1:0, transition:"all .9s ease .65s" }}>
              <button className="btn-gold" onClick={() => go("contact")}
                style={{ background:"var(--navy)", border:"none", color:"#fff",
                  padding:"13px 30px", borderRadius:3, cursor:"pointer",
                  fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600, letterSpacing:.2 }}>
                Request a Consultation
              </button>
              <button className="btn-outline" onClick={() => go("about")}
                style={{ background:"none", border:"1px solid var(--border)", color:"var(--body)",
                  padding:"13px 30px", borderRadius:3, cursor:"pointer",
                  fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:400 }}>
                About the Advocate
              </button>
            </div>

            {/* Contact row */}
            <div style={{ display:"flex", gap:24, flexWrap:"wrap",
              borderTop:"1px solid var(--border)", paddingTop:24,
              opacity:loaded?1:0, transition:"all .9s ease .75s" }}>
              {[["Phone","94593-48501","tel:+919459348501"],["Alternate","80917-99979","tel:+918091799979"],["Email","tkadv1992@gmail.com","mailto:tkadv1992@gmail.com"]].map(([l,v,h])=>(
                <div key={v}>
                  <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:1.5,
                    textTransform:"uppercase", marginBottom:3,
                    fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>{l}</div>
                  <a href={h} style={{ fontSize:13, color:"var(--heading)",
                    fontFamily:"'DM Sans',sans-serif", textDecoration:"none", fontWeight:500 }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--heading)"}>{v}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stat panel */}
          <div className="stats-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2,
            opacity:loaded?1:0, transform:loaded?"none":"translateX(28px)",
            transition:"all 1s ease .4s" }}>
            {[
              { n:"30+", l:"Years of Practice", s:"Since 1992" },
              { n:"500+", l:"Cases Handled", s:"All courts" },
              { n:"4", l:"Legal Experts", s:"Dedicated team" },
              { n:"267", l:"Chamber No.", s:"HP High Court" },
            ].map((s, i) => (
              <div key={s.l}
                style={{ background:"#fff", border:"1px solid var(--border)",
                  padding:"24px 18px", textAlign:"center",
                  borderRadius: i===0?"4px 0 0 0": i===1?"0 4px 0 0": i===2?"0 0 0 4px":"0 0 4px 0" }}>
                <div style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
                  fontSize:"2rem", color:"var(--navy)", marginBottom:6 }}>{s.n}</div>
                <div style={{ fontSize:11, color:"var(--heading)", letterSpacing:.3,
                  marginBottom:4, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>{s.l}</div>
                <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"'DM Sans',sans-serif" }}>{s.s}</div>
              </div>
            ))}
            {/* Call now full-width */}
            <a href="tel:+919459348501"
              style={{ gridColumn:"1/-1", background:"var(--navy)", borderRadius:"0 0 4px 4px",
                padding:"18px", textAlign:"center", textDecoration:"none",
                display:"block", transition:"background .2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#0f1520"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--navy)"}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.55)",
                letterSpacing:1.5, textTransform:"uppercase",
                fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>Call for Consultation</div>
              <div style={{ fontSize:18, color:"#fff",
                fontFamily:"'Libre Baskerville',serif", fontWeight:700 }}>94593-48501</div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0,
        height:1, background:"var(--border)" }} />
    </section>
  );
}

/* ── about ───────────────────────────────────────────── */
function About() {
  useReveal();
  return (
    <section id="about" style={{ background:"var(--white)",
      padding:"96px clamp(1.5rem,5vw,4rem)" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>

        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:64, alignItems:"start", marginBottom:72 }}>
          {/* Left */}
          <div className="rvl">
            <Label>About the Counsel</Label>
            <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
              fontSize:"clamp(1.7rem,3.2vw,2.4rem)", color:"var(--heading)",
              lineHeight:1.15, marginBottom:24 }}>
              Three Decades of<br />
              <em style={{ fontWeight:400, color:"var(--gold)" }}>Distinguished Practice</em>
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"1rem",
              color:"var(--body)", lineHeight:1.9, marginBottom:18, fontWeight:300 }}>
              Advocate T.K. Verma has been a member of the Bar Council of Himachal Pradesh since 1992,
              holding a B.A. LLB (Honours) and a Master of Laws. He regularly appears before the
              Hon'ble HP High Court and all District Courts of Shimla from his chambers at
              Chamber No. 267, HP High Court Complex.
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"1rem",
              color:"var(--body)", lineHeight:1.9, fontWeight:300 }}>
              Over three decades of practice have shaped a counsel known for thorough preparation,
              measured courtroom conduct, and an unwavering focus on his clients' interests.
              He accepts matters across the full range of civil, criminal, constitutional
              and personal law.
            </p>

            {/* Credential tiles */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:32 }}>
              {[
                ["B.A. LLB (Hons.)", "Bachelor of Laws with Honours"],
                ["LLM", "Master of Laws"],
                ["Bar Council of HP", "Since 1992"],
                ["Chamber No. 267", "HP High Court, Shimla"],
              ].map(([t,s]) => (
                <div key={t} style={{ background:"var(--ivory)",
                  border:"1px solid var(--border)", borderRadius:3,
                  padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Libre Baskerville',serif",
                    fontSize:13, color:"var(--heading)", fontWeight:700, marginBottom:3 }}>{t}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",
                    fontSize:11.5, color:"var(--muted)", fontWeight:300 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — courts + timeline */}
          <div className="rvr" style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {/* Courts */}
            <div style={{ border:"1px solid var(--border)", borderRadius:3,
              overflow:"hidden" }}>
              <div style={{ background:"var(--navy)", padding:"14px 20px",
                borderBottom:"3px solid var(--gold)" }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                  color:"rgba(255,255,255,.8)", letterSpacing:1.5,
                  textTransform:"uppercase", fontWeight:600 }}>Courts of Practice</span>
              </div>
              {["HP High Court, Shimla","District & Sessions Court, Shimla","Civil Judge Courts, Shimla","Family Courts, Shimla","Revenue Courts, HP","Consumer Redressal Commission, HP"].map((c, i) => (
                <div key={c} style={{ padding:"11px 20px",
                  borderBottom:i<5?"1px solid var(--stone)":"none",
                  display:"flex", alignItems:"center", gap:12,
                  background: i%2===0 ? "var(--white)" : "var(--ivory)" }}>
                  <div style={{ width:5, height:5, borderRadius:"50%",
                    background:"var(--gold)", flexShrink:0 }} />
                  <span style={{ fontFamily:"'DM Sans',sans-serif",
                    fontSize:13, color:"var(--body)", fontWeight:300 }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ border:"1px solid var(--border)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ background:"var(--navy)", padding:"14px 20px",
                borderBottom:"3px solid var(--gold)" }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                  color:"rgba(255,255,255,.8)", letterSpacing:1.5,
                  textTransform:"uppercase", fontWeight:600 }}>Career Milestones</span>
              </div>
              {[
                ["1992","Enrolled — Bar Council of HP"],
                ["1995","Regular HP High Court practice"],
                ["2000","LLM awarded"],
                ["2005","Chamber 267 established"],
                ["2015","Team of four advocates"],
                ["2024","30+ years · 500+ cases"],
              ].map(([y,e], i, a) => (
                <div key={y} style={{ display:"flex", gap:0,
                  borderBottom:i<a.length-1?"1px solid var(--stone)":"none",
                  background: i%2===0 ? "var(--white)" : "var(--ivory)" }}>
                  <div style={{ padding:"11px 16px", width:60, flexShrink:0,
                    borderRight:"1px solid var(--border)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'Libre Baskerville',serif",
                      fontSize:12, color:"var(--gold)", fontWeight:700 }}>{y}</span>
                  </div>
                  <div style={{ padding:"11px 16px", display:"flex", alignItems:"center" }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",
                      fontSize:12.5, color:"var(--body)", fontWeight:300 }}>{e}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── team ────────────────────────────────────────────── */
function OurTeam() {
  useReveal();
  return (
    <section id="our-team" style={{ background:"var(--ivory)",
      padding:"96px clamp(1.5rem,5vw,4rem)", borderTop:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>

        <div className="rv" style={{ marginBottom:56 }}>
          <Label>Legal Team</Label>
          <div style={{ display:"flex", alignItems:"flex-end",
            justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
              fontSize:"clamp(1.7rem,3.2vw,2.4rem)", color:"var(--heading)", lineHeight:1.12 }}>
              Meet the Advocates
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
              color:"var(--muted)", maxWidth:400, lineHeight:1.7, fontWeight:300 }}>
              A team of four dedicated advocates covering the full breadth of
              legal practice in Himachal Pradesh.
            </p>
          </div>
          <div style={{ width:"100%", height:1, background:"var(--border)", marginTop:32 }} />
        </div>

        <div className="four-col" style={{ display:"grid",
          gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"var(--border)",
          border:"1px solid var(--border)", borderRadius:4, overflow:"hidden" }}>
          {TEAM.map((m, i) => (
            <div key={m.name} className="rv"
              style={{ background:"var(--white)", transitionDelay:`${i*.08}s`,
                display:"flex", flexDirection:"column" }}>

              {/* Photo */}
              <div style={{ position:"relative", paddingTop:"118%", overflow:"hidden",
                background:"var(--stone)" }}>
                <img
                  src={m.img} alt={`${m.name}, ${m.role}`}
                  style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%",
                    objectFit:"cover", objectPosition:"top center",
                    filter:"grayscale(18%)", transition:"filter .3s ease, transform .4s ease" }}
                  onMouseEnter={e=>{ e.target.style.filter="grayscale(0%)"; e.target.style.transform="scale(1.03)"; }}
                  onMouseLeave={e=>{ e.target.style.filter="grayscale(18%)"; e.target.style.transform="scale(1)"; }}
                  onError={e=>{
                    e.target.style.display="none";
                    e.target.parentNode.style.display="flex";
                    e.target.parentNode.style.alignItems="center";
                    e.target.parentNode.style.justifyContent="center";
                    e.target.parentNode.style.paddingTop="0";
                    e.target.parentNode.style.height="220px";
                    e.target.parentNode.innerHTML=`<div style="width:72px;height:72px;border-radius:50%;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:'Libre Baskerville',serif;font-size:26px;font-weight:700;color:var(--gold)">${m.name.charAt(0)}</div>`;
                  }}
                />
                {/* Exp badge */}
                <div style={{ position:"absolute", bottom:10, left:10,
                  background:"var(--navy)", color:"#fff",
                  fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
                  padding:"3px 10px", letterSpacing:1, textTransform:"uppercase" }}>
                  {m.exp}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding:"20px 18px 22px", flex:1,
                borderTop:"2px solid var(--gold)" }}>
                <div style={{ fontFamily:"'Libre Baskerville',serif",
                  fontSize:"1rem", color:"var(--heading)", fontWeight:700, marginBottom:2 }}>{m.name}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                  color:"var(--gold)", letterSpacing:1, textTransform:"uppercase",
                  fontWeight:600, marginBottom:8 }}>{m.role}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                  color:"var(--muted)", marginBottom:14, fontWeight:300, fontStyle:"italic" }}>{m.qual}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                  color:"var(--body)", lineHeight:1.75, fontWeight:300, marginBottom:14 }}>{m.bio}</p>
                <div style={{ borderTop:"1px solid var(--stone)", paddingTop:12 }}>
                  <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:1.5,
                    textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif",
                    fontWeight:600, marginBottom:7 }}>Areas of Focus</div>
                  {m.focus.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:7,
                      padding:"3.5px 0", borderBottom:"1px solid var(--stone)" }}>
                      <div style={{ width:4, height:4, borderRadius:"50%",
                        background:"var(--gold)", flexShrink:0 }} />
                      <span style={{ fontFamily:"'DM Sans',sans-serif",
                        fontSize:12, color:"var(--body)", fontWeight:300 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Combined experience note */}
        <div className="rv" style={{ marginTop:1,
          background:"var(--navy)", borderRadius:"0 0 4px 4px",
          padding:"22px 28px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontFamily:"'Libre Baskerville',serif",
              fontSize:16, color:"#fff", fontWeight:700, marginBottom:4 }}>
              55+ Years of Combined Legal Experience
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
              color:"rgba(255,255,255,.5)", fontWeight:300 }}>
              Our team covers every area of law practised before the courts of Himachal Pradesh.
            </div>
          </div>
          <button className="btn-gold"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" })}
            style={{ background:"var(--gold)", border:"none", color:"#fff",
              padding:"11px 26px", borderRadius:3, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
              letterSpacing:.2, flexShrink:0 }}>
            Book a Consultation
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── practice ─────────────────────────────────────────── */
function Practice() {
  useReveal();
  const [exp, setExp] = useState(null);
  return (
    <section id="practice" style={{ background:"var(--white)",
      padding:"96px clamp(1.5rem,5vw,4rem)", borderTop:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>

        <div className="rv" style={{ marginBottom:56 }}>
          <Label>Areas of Practice</Label>
          <div style={{ display:"flex", alignItems:"flex-end",
            justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
              fontSize:"clamp(1.7rem,3.2vw,2.4rem)", color:"var(--heading)", lineHeight:1.12 }}>
              Legal Services Offered
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
              color:"var(--muted)", maxWidth:380, lineHeight:1.7, fontWeight:300 }}>
              Comprehensive representation before all courts and tribunals
              in Himachal Pradesh.
            </p>
          </div>
          <div style={{ width:"100%", height:1, background:"var(--border)", marginTop:32 }} />
        </div>

        <div className="three-col" style={{ display:"grid",
          gridTemplateColumns:"repeat(3,1fr)", gap:1,
          background:"var(--border)", border:"1px solid var(--border)", borderRadius:4, overflow:"hidden" }}>
          {PRACTICE.map((p, i) => (
            <div key={p.t} className="rv card"
              style={{ background:"var(--white)", padding:"26px 24px",
                cursor:"pointer", transitionDelay:`${i*.04}s`,
                borderBottom: i<6 ? "1px solid var(--border)" : "none",
                position:"relative", overflow:"hidden" }}
              onClick={() => setExp(i===exp?null:i)}
              onMouseEnter={e=>e.currentTarget.style.background="var(--ivory)"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--white)"}>
              {/* Gold left accent */}
              <div style={{ position:"absolute", left:0, top:0, bottom:0,
                width:3, background:exp===i?"var(--gold)":"transparent",
                transition:"background .2s" }} />
              <div style={{ fontFamily:"'Libre Baskerville',serif",
                fontSize:"0.95rem", color:"var(--heading)", fontWeight:700,
                marginBottom:8, paddingLeft:12 }}>{p.t}</div>
              <div style={{ overflow:"hidden", maxHeight:exp===i?200:0,
                transition:"max-height .35s ease" }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                  color:"var(--muted)", lineHeight:1.75, fontWeight:300,
                  paddingLeft:12, marginBottom:4 }}>{p.d}</p>
              </div>
              <div style={{ paddingLeft:12, marginTop:exp===i?10:4 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:11, color:"var(--gold)", fontWeight:500,
                  letterSpacing:.5 }}>{exp===i?"Show less ↑":"Read more ↓"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rv" style={{ marginTop:40, padding:"22px 28px",
          background:"var(--ivory)", border:"1px solid var(--border)", borderRadius:3,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
            color:"var(--muted)", fontWeight:300, fontStyle:"italic" }}>
            Don't see your matter listed? We handle a broad range of legal issues — contact us to discuss.
          </p>
          <button className="btn-gold"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" })}
            style={{ background:"var(--navy)", border:"none", color:"#fff",
              padding:"10px 24px", borderRadius:3, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, flexShrink:0 }}>
            Discuss Your Matter
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── testimonials ─────────────────────────────────────── */
function Testimonials() {
  const [cur, setCur] = useState(0);
  useReveal();
  useEffect(() => {
    const t = setInterval(() => setCur(c => (c+1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);
  return (
    <section style={{ background:"var(--navy)",
      padding:"96px clamp(1.5rem,5vw,4rem)" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>

        <div className="rv" style={{ display:"flex", alignItems:"flex-end",
          justifyContent:"space-between", flexWrap:"wrap", gap:24, marginBottom:52 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
              <div style={{ width:28, height:2, background:"var(--gold)", borderRadius:1 }} />
              <span style={{ fontSize:11, color:"var(--gold)", letterSpacing:2.5,
                textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                Client Testimonials
              </span>
            </div>
            <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
              fontSize:"clamp(1.7rem,3.2vw,2.4rem)", color:"#fff", lineHeight:1.12 }}>
              Words from Our Clients
            </h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setCur(i)}
                style={{ width:i===cur?28:8, height:8, borderRadius:4, border:"none",
                  cursor:"pointer", background:i===cur?"var(--gold)":"rgba(255,255,255,.15)",
                  transition:"all .3s" }} />
            ))}
          </div>
        </div>

        {/* Featured */}
        <div className="rv two-col" style={{ display:"grid",
          gridTemplateColumns:"1fr 360px", gap:40, marginBottom:40 }}>
          <div style={{ background:"rgba(255,255,255,.05)",
            border:"1px solid rgba(255,255,255,.08)", borderRadius:3, padding:"40px 36px",
            borderLeft:"4px solid var(--gold)" }}>
            <div style={{ fontFamily:"'Libre Baskerville',serif",
              fontSize:52, color:"rgba(154,124,58,.25)", lineHeight:1,
              marginBottom:20, userSelect:"none" }}>"</div>
            <p style={{ fontFamily:"'Libre Baskerville',serif",
              fontSize:"clamp(1rem,1.8vw,1.12rem)", color:"rgba(255,255,255,.85)",
              lineHeight:2, fontStyle:"italic", fontWeight:400, marginBottom:28 }}>
              {TESTIMONIALS[cur].body}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:14,
              borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:22 }}>
              <div style={{ width:44, height:44, borderRadius:"50%",
                background:"var(--gold)", display:"flex", alignItems:"center",
                justifyContent:"center", fontFamily:"'Libre Baskerville',serif",
                fontWeight:700, fontSize:17, color:"#fff", flexShrink:0 }}>
                {TESTIMONIALS[cur].name.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  color:"#fff", fontSize:14, fontWeight:600 }}>{TESTIMONIALS[cur].name}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  color:"rgba(255,255,255,.4)", fontSize:12, fontWeight:300,
                  fontStyle:"italic", marginTop:2 }}>{TESTIMONIALS[cur].matter}</div>
              </div>
            </div>
          </div>

          {/* All testimonials list */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {TESTIMONIALS.map((t,i) => (
              <button key={t.name} onClick={() => setCur(i)}
                style={{ background:cur===i?"rgba(154,124,58,.12)":"rgba(255,255,255,.04)",
                  border:`1px solid ${cur===i?"rgba(154,124,58,.4)":"rgba(255,255,255,.07)"}`,
                  borderRadius:3, padding:"16px 18px", textAlign:"left", cursor:"pointer",
                  transition:"all .22s", borderLeft:cur===i?"4px solid var(--gold)":"4px solid transparent" }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:13, color:"#fff", fontWeight:600, marginBottom:3 }}>{t.name}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:300,
                  fontStyle:"italic", marginBottom:8 }}>{t.matter}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:12, color:"rgba(255,255,255,.5)", lineHeight:1.6,
                  fontWeight:300 }}>{t.body.substring(0,90)}…</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── contact ─────────────────────────────────────────── */
function Contact() {
  const [form, setForm] = useState({
    name:"", phone:"", email:"", matter:"", court:"",
    urgency:"Normal", message:"", heard:""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  useReveal();

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:""})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) e.phone = "Enter a valid number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.matter) e.matter = "Please select";
    if (!form.message.trim() || form.message.trim().length < 20) e.message = "Minimum 20 characters";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1400);
  };

  const inp = err => ({
    width:"100%", background: err ? "#fef2f2" : "var(--ivory)",
    border:`1px solid ${err?"#fca5a5":"var(--border)"}`,
    borderRadius:3, padding:"11px 13px", color:"var(--heading)",
    fontSize:13.5, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box",
    fontWeight:300, transition:"all .2s",
  });

  return (
    <section id="contact" style={{ background:"var(--ivory)",
      padding:"96px clamp(1.5rem,5vw,4rem)", borderTop:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>

        <div className="rv" style={{ marginBottom:56 }}>
          <Label>Contact the Office</Label>
          <div style={{ display:"flex", alignItems:"flex-end",
            justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
              fontSize:"clamp(1.7rem,3.2vw,2.4rem)", color:"var(--heading)", lineHeight:1.12 }}>
              Request a Consultation
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
              color:"var(--muted)", maxWidth:380, lineHeight:1.7, fontWeight:300 }}>
              Every enquiry receives a personal response from the advocate's office within one business day.
            </p>
          </div>
          <div style={{ width:"100%", height:1, background:"var(--border)", marginTop:32 }} />
        </div>

        <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:40 }}>
          {/* Left: contact info */}
          <div className="rvl" style={{ display:"flex", flexDirection:"column", gap:0,
            border:"1px solid var(--border)", borderRadius:3, overflow:"hidden", alignSelf:"start" }}>
            <div style={{ background:"var(--navy)", padding:"16px 20px", borderBottom:"3px solid var(--gold)" }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                color:"rgba(255,255,255,.7)", letterSpacing:1.8, textTransform:"uppercase", fontWeight:600 }}>
                Office Details
              </span>
            </div>
            {[
              { label:"Address", val:["Chamber No. 267","HP High Court Complex","Shimla, HP — 171001"] },
              { label:"Primary", val:"94593-48501", link:"tel:+919459348501" },
              { label:"Alternate", val:"80917-99979", link:"tel:+918091799979" },
              { label:"Email", val:"tkadv1992@gmail.com", link:"mailto:tkadv1992@gmail.com" },
              { label:"Website", val:"tkverma.hphighcourt.com", link:"https://tkverma.hphighcourt.com" },
              { label:"Hours", val:["Mon – Sat","10:00 AM – 5:00 PM","(Subject to court schedule)"] },
            ].map((item, i, a) => (
              <div key={item.label} style={{ padding:"14px 20px",
                borderBottom:i<a.length-1?"1px solid var(--stone)":"none",
                background: i%2===0 ? "var(--white)" : "var(--ivory)" }}>
                <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:1.5,
                  textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600, marginBottom:5 }}>{item.label}</div>
                {Array.isArray(item.val)
                  ? item.val.map((v,j) => (
                    <div key={j} style={{ fontFamily:"'DM Sans',sans-serif",
                      fontSize:13, color:"var(--body)", lineHeight:1.6, fontWeight:300 }}>{v}</div>
                  ))
                  : item.link
                  ? <a href={item.link}
                      style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                        color:"var(--heading)", textDecoration:"none", fontWeight:500 }}
                      onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"}
                      onMouseLeave={e=>e.currentTarget.style.color="var(--heading)"}>
                      {item.val}
                    </a>
                  : <div style={{ fontFamily:"'DM Sans',sans-serif",
                      fontSize:13, color:"var(--body)", fontWeight:300 }}>{item.val}</div>
                }
              </div>
            ))}
            <a href="tel:+919459348501"
              style={{ display:"block", background:"var(--navy)", padding:"18px 20px",
                textDecoration:"none", textAlign:"center", transition:"background .2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#0f1520"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--navy)"}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.45)", letterSpacing:1.8,
                textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>
                Call for Consultation
              </div>
              <div style={{ fontFamily:"'Libre Baskerville',serif",
                fontSize:17, color:"#fff", fontWeight:700 }}>94593-48501</div>
            </a>
          </div>

          {/* Right: form */}
          <div className="rvr">
            {done ? (
              <div style={{ background:"var(--white)", border:"1px solid var(--border)",
                borderRadius:3, padding:"60px 40px", textAlign:"center",
                animation:"slideUp .4s ease" }}>
                <div style={{ width:52, height:52, borderRadius:"50%",
                  background:"#f0fdf4", border:"2px solid #86efac",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, margin:"0 auto 20px" }}>✓</div>
                <h3 style={{ fontFamily:"'Libre Baskerville',serif",
                  fontSize:"1.4rem", color:"var(--heading)", marginBottom:12 }}>Enquiry Received</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
                  color:"var(--muted)", lineHeight:1.8, maxWidth:380, margin:"0 auto 24px", fontWeight:300 }}>
                  Thank you, <strong style={{color:"var(--heading)",fontWeight:600}}>{form.name}</strong>.
                  We will contact you at <strong style={{color:"var(--heading)",fontWeight:600}}>{form.phone}</strong> within one business day.
                  All communications are strictly confidential.
                </p>
                <button onClick={()=>{ setDone(false); setForm({name:"",phone:"",email:"",matter:"",court:"",urgency:"Normal",message:"",heard:""}); }}
                  className="btn-outline"
                  style={{ background:"none", border:"1px solid var(--border)",
                    color:"var(--body)", padding:"10px 24px", borderRadius:3, cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <div style={{ background:"var(--white)", border:"1px solid var(--border)",
                borderRadius:3, overflow:"hidden" }}>
                <div style={{ padding:"16px 24px", background:"var(--stone)",
                  borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                    color:"var(--muted)", letterSpacing:1.8, textTransform:"uppercase", fontWeight:600 }}>
                    Enquiry Form
                  </span>
                </div>
                <div style={{ padding:"28px 24px" }}>
                  <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                        letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                        fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Full Name *</label>
                      <input style={inp(errors.name)} value={form.name}
                        onChange={e=>set("name",e.target.value)} placeholder="Your full name" />
                      {errors.name && <div style={{ color:"#b91c1c", fontSize:11, marginTop:3 }}>{errors.name}</div>}
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                        letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                        fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Phone Number *</label>
                      <input style={inp(errors.phone)} value={form.phone}
                        onChange={e=>set("phone",e.target.value)} placeholder="+91 XXXXX XXXXX" />
                      {errors.phone && <div style={{ color:"#b91c1c", fontSize:11, marginTop:3 }}>{errors.phone}</div>}
                    </div>
                  </div>

                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                      letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                      fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Email Address</label>
                    <input style={inp(errors.email)} value={form.email}
                      onChange={e=>set("email",e.target.value)} placeholder="your@email.com (optional)" />
                    {errors.email && <div style={{ color:"#b91c1c", fontSize:11, marginTop:3 }}>{errors.email}</div>}
                  </div>

                  <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                        letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                        fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Nature of Matter *</label>
                      <select style={{ ...inp(errors.matter), appearance:"none", cursor:"pointer" }}
                        value={form.matter} onChange={e=>set("matter",e.target.value)}>
                        <option value="">Select type of matter…</option>
                        {["Civil Litigation","Criminal Defence","Property / Real Estate","Family / Matrimonial","Constitutional / Writ","Service / Labour","Revenue / Land","Consumer Dispute","Arbitration / Mediation","Other"].map(o=>(
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      {errors.matter && <div style={{ color:"#b91c1c", fontSize:11, marginTop:3 }}>{errors.matter}</div>}
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                        letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                        fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Urgency</label>
                      <select style={{ ...inp(false), appearance:"none", cursor:"pointer" }}
                        value={form.urgency} onChange={e=>set("urgency",e.target.value)}>
                        {["Normal","Urgent — within 1 week","Very Urgent — within 48 hrs"].map(o=>(
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                      letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                      fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Court / Jurisdiction</label>
                    <select style={{ ...inp(false), appearance:"none", cursor:"pointer" }}
                      value={form.court} onChange={e=>set("court",e.target.value)}>
                      <option value="">Select if known…</option>
                      {["HP High Court, Shimla","District Court, Shimla","Family Court, Shimla","Revenue Court, HP","Consumer Forum, HP","Other / Not Sure"].map(o=>(
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                      letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                      fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Brief Description *</label>
                    <textarea style={{ ...inp(errors.message), minHeight:100, resize:"vertical", lineHeight:1.7 }}
                      value={form.message} onChange={e=>set("message",e.target.value)}
                      placeholder="Please describe your legal matter — key facts, relief sought, and any upcoming dates or deadlines." />
                    {errors.message && <div style={{ color:"#b91c1c", fontSize:11, marginTop:3 }}>{errors.message}</div>}
                    <div style={{ textAlign:"right", fontSize:10, color:"var(--muted)", marginTop:3 }}>{form.message.length} characters</div>
                  </div>

                  <div style={{ marginBottom:22 }}>
                    <label style={{ display:"block", fontSize:11, color:"var(--muted)",
                      letterSpacing:1, textTransform:"uppercase", marginBottom:6,
                      fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>How Did You Find Us?</label>
                    <select style={{ ...inp(false), appearance:"none", cursor:"pointer" }}
                      value={form.heard} onChange={e=>set("heard",e.target.value)}>
                      <option value="">Select…</option>
                      {["Word of mouth / Referral","Google Search","Previous client","Court premises","Other"].map(o=>(
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background:"var(--ivory)", border:"1px solid var(--border)",
                    borderRadius:3, padding:"11px 13px", marginBottom:20 }}>
                    <p style={{ fontSize:12, color:"var(--muted)", margin:0,
                      lineHeight:1.65, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
                      All enquiries are subject to strict attorney-client confidentiality and will not be disclosed to any third party.
                    </p>
                  </div>

                  <button onClick={submit} disabled={loading} className="btn-gold"
                    style={{ width:"100%", background:loading?"var(--stone)":"var(--navy)",
                      border:"none", color:loading?"var(--muted)":"#fff",
                      padding:"14px", borderRadius:3, cursor:loading?"wait":"pointer",
                      fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
                      letterSpacing:.2, display:"flex", alignItems:"center",
                      justifyContent:"center", gap:10, transition:"background .2s" }}>
                    {loading
                      ? <><div style={{ width:16, height:16, border:"2px solid rgba(0,0,0,.15)",
                          borderTopColor:"var(--muted)", borderRadius:"50%", animation:"spin .8s linear infinite" }} />Submitting…</>
                      : "Submit Enquiry"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── footer ──────────────────────────────────────────── */
function Footer({ setActive }) {
  const go = n => {
    document.getElementById(n.toLowerCase().replace(/\s+/g,"-"))?.scrollIntoView({ behavior:"smooth" });
    setActive(n);
  };
  return (
    <footer style={{ background:"var(--heading)", borderTop:"1px solid rgba(255,255,255,.06)",
      padding:"56px clamp(1.5rem,5vw,4rem) 28px" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        <div className="footer-grid" style={{ display:"grid",
          gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48,
          paddingBottom:48, borderBottom:"1px solid rgba(255,255,255,.07)" }}>

          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, background:"var(--gold)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15, color:"#fff", borderRadius:2 }}>⚖</div>
              <div>
                <div style={{ fontFamily:"'Libre Baskerville',serif", fontWeight:700,
                  fontSize:14, color:"#fff", letterSpacing:.3 }}>T.K. Verma</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.35)", letterSpacing:2,
                  textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Advocate · Shimla</div>
              </div>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
              color:"rgba(255,255,255,.35)", lineHeight:1.85, maxWidth:260,
              marginBottom:20, fontWeight:300 }}>
              Practising before the HP High Court and District Courts, Shimla since 1992.
              Committed to justice, guided by integrity.
            </p>
            <a href="https://tkverma.hphighcourt.com"
              style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                color:"rgba(255,255,255,.3)", textDecoration:"none", display:"block",
                marginBottom:14, letterSpacing:.3, transition:"color .2s" }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--gold-lt)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.3)"}>
              tkverma.hphighcourt.com
            </a>
            {[["94593-48501","tel:+919459348501"],["80917-99979","tel:+918091799979"],["tkadv1992@gmail.com","mailto:tkadv1992@gmail.com"]].map(([v,h])=>(
              <a key={v} href={h}
                style={{ display:"block", fontFamily:"'DM Sans',sans-serif",
                  fontSize:12, color:"rgba(255,255,255,.3)", textDecoration:"none",
                  marginBottom:5, fontWeight:300, transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.75)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.3)"}>
                {v}
              </a>
            ))}
          </div>

          {[
            { title:"Navigation", items:NAV, type:"nav" },
            { title:"Practice Areas", items:PRACTICE.slice(0,6).map(p=>p.t), type:"list" },
            { title:"Our Team", items:TEAM.map(m=>({ name:m.name, role:m.role })), type:"team" },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", letterSpacing:2.5,
                textTransform:"uppercase", marginBottom:18, fontFamily:"'DM Sans',sans-serif",
                fontWeight:600 }}>{col.title}</div>
              {col.type === "nav" && col.items.map(n => (
                <button key={n} onClick={() => go(n)}
                  style={{ display:"block", background:"none", border:"none",
                    cursor:"pointer", color:"rgba(255,255,255,.35)", fontSize:12.5,
                    fontFamily:"'DM Sans',sans-serif", padding:"3.5px 0",
                    letterSpacing:.2, transition:"color .18s", textAlign:"left",
                    fontWeight:300 }}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.8)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.35)"}>
                  {n}
                </button>
              ))}
              {col.type === "list" && col.items.map(item => (
                <div key={item} style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:12, color:"rgba(255,255,255,.3)", padding:"3px 0", fontWeight:300 }}>
                  {item}
                </div>
              ))}
              {col.type === "team" && col.items.map(m => (
                <div key={m.name} style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",
                    fontSize:12.5, color:"rgba(255,255,255,.5)", fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",
                    fontSize:11, color:"rgba(154,124,58,.6)", fontWeight:300 }}>{m.role}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:11.5, color:"rgba(255,255,255,.2)",
            fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
            © {new Date().getFullYear()} T.K. Verma, Advocate. All rights reserved. &nbsp;·&nbsp; Bar Council of HP
          </div>
          <div style={{ fontSize:11.5, color:"rgba(255,255,255,.2)",
            fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
            Chamber 267 · HP High Court · Shimla · HP — 171001
          </div>
        </div>
        <div style={{ marginTop:14, padding:"10px 14px",
          background:"rgba(255,255,255,.03)", borderRadius:2 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.15)", margin:0,
            lineHeight:1.65, fontFamily:"'DM Sans',sans-serif", fontWeight:300,
            textAlign:"center" }}>
            <strong style={{color:"rgba(255,255,255,.2)",fontWeight:500}}>Disclaimer:</strong>{" "}
            The information on this website is provided for general informational purposes only and does not constitute legal advice. Use of this website does not create an advocate-client relationship. For legal advice specific to your matter, please contact T.K. Verma, Advocate directly.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── back to top ─────────────────────────────────────── */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
      style={{ position:"fixed", bottom:24, right:24, zIndex:99,
        width:40, height:40, borderRadius:3, background:"var(--navy)",
        border:"1px solid var(--border)", color:"#fff", fontSize:16,
        cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,.18)",
        animation:"fadeIn .3s ease", display:"flex", alignItems:"center",
        justifyContent:"center", transition:"background .2s" }}
      onMouseEnter={e=>e.currentTarget.style.background="var(--gold)"}
      onMouseLeave={e=>e.currentTarget.style.background="var(--navy)"}>
      ↑
    </button>
  );
}

/* ── app ─────────────────────────────────────────────── */
export default function App() {
  const [active, setActive] = useState("Home");
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.sec); });
    }, { threshold: 0.3 });
    NAV.forEach(n => {
      const el = document.getElementById(n.toLowerCase().replace(/\s+/g,"-"));
      if (el) { el.dataset.sec = n; obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"var(--white)", overflowX:"hidden" }}>
      <SEO />
      <TopBar />
      <Navbar active={active} setActive={setActive} onLogin={() => setLoginOpen(true)} />
      <Hero setActive={setActive} />
      <About />
      <OurTeam />
      <Practice />
      <Testimonials />
      <Contact />
      <Footer setActive={setActive} />
      <BackToTop />
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}