import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  Globe,
  Link as LinkIcon,
  Sparkles,
  Shield,
} from "lucide-react";

/**
 * Landing — public landing page with hero and feature highlights
 */
export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Calendar size={24} />,
      title: "Smart Scheduling",
      desc: "Set your availability and let others book appointments without the back-and-forth emails.",
    },
    {
      icon: <Globe size={24} />,
      title: "Timezone Support",
      desc: "Automatically handles timezone conversions so everyone sees the right time.",
    },
    {
      icon: <LinkIcon size={24} />,
      title: "Shareable Links",
      desc: "Share your personal booking link and let anyone schedule time with you.",
    },
    {
      icon: <Clock size={24} />,
      title: "Calendar Sync",
      desc: "Integrate with Google Calendar to automatically sync your appointments.",
    },
    {
      icon: <Sparkles size={24} />,
      title: "AI-Powered",
      desc: 'Use natural language to find available slots — "Book me a slot next Wednesday afternoon".',
    },
    {
      icon: <Shield size={24} />,
      title: "Secure & Private",
      desc: "Your data is encrypted and securely stored. Only you control your schedule.",
    },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 24px 60px",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div className="animate-fadeInUp">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "var(--primary-light)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            <Sparkles size={14} />
            AI-Powered Scheduling
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: "-1px",
            }}
          >
            Schedule meetings{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-light), var(--accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              without the hassle
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              maxWidth: 600,
              margin: "0 auto 36px",
              lineHeight: 1.7,
            }}
          >
            Set your availability, share your link, and let others book
            appointments with ease. No more back-and-forth emails.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn btn-primary btn-lg"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        style={{
          padding: "40px 24px 80px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: 28,
                animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(99, 102, 241, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-light)",
                  marginBottom: 16,
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} EcoTech Scheduler. Designed & built with ❤️
        by Vidhan Kadu.
      </footer>
    </div>
  );
}
