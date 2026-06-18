import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFeedClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (location.pathname === "/feed") {
      window.location.reload();
    } else {
      navigate("/feed");
    }
  };

  const socialButton = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
    transition: "all .25s ease",
    cursor: "pointer",
  };

  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "36px 24px 20px",
        background: "rgba(8,12,20,.88)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(99,102,241,.12)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        {/* ================= BRAND ================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background:
                "linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(99,102,241,.45)",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>

          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--t1)",
                letterSpacing: ".3px",
              }}
            >
              DevConnect
            </div>


            <div
              style={{
                marginTop: 3,
                fontSize: 13,
                color: "var(--t3)",
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              <span>Powered by</span>

              <span
                style={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                skyward
              </span>
            </div>
          </div>
        </div>

        {/* ================= SOCIAL ================= */}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://github.com/aako-aakash"
            target="_blank"
            rel="noreferrer"
            style={{
              ...socialButton,
              background: "rgba(99,102,241,.08)",
              border: "1px solid rgba(99,102,241,.18)",
              color: "#c7d2fe",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background =
                "rgba(99,102,241,.16)";
              e.currentTarget.style.borderColor =
                "rgba(99,102,241,.4)";
              e.currentTarget.style.boxShadow =
                "0 10px 22px rgba(99,102,241,.18)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background =
                "rgba(99,102,241,.08)";
              e.currentTarget.style.borderColor =
                "rgba(99,102,241,.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.628-5.48 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12 24 5.373 18.627 0 12 0z" />
            </svg>

            GitHub
          </a>

          <a
            href="https://linkedin.com/in/aako-aakash"
            target="_blank"
            rel="noreferrer"
            style={{
              ...socialButton,
              background: "rgba(14,118,232,.08)",
              border: "1px solid rgba(14,118,232,.18)",
              color: "#60a5fa",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background =
                "rgba(14,118,232,.16)";
              e.currentTarget.style.borderColor =
                "rgba(14,118,232,.38)";
              e.currentTarget.style.boxShadow =
                "0 10px 22px rgba(14,118,232,.18)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background =
                "rgba(14,118,232,.08)";
              e.currentTarget.style.borderColor =
                "rgba(14,118,232,.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11-.001-4.124 2.062 2.062 0 01.001 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>

            LinkedIn
          </a>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}

      <div
        style={{
          maxWidth: 1100,
          margin: "28px auto 0",
          paddingTop: 18,
          borderTop: "1px solid rgba(99,102,241,.08)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,.55)",
            letterSpacing: ".2px",
          }}
        >
          © {new Date().getFullYear()} DevConnect • Built with React,
          FastAPI, PostgreSQL, Docker, Neon, Vercel & Render.
        </span>
      </div>
    </footer>
  );
}
