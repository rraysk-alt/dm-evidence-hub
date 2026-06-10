import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sales Objections – Evidence Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Teal accent bar top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#009AAB", display: "flex" }} />

        {/* Background geometric decoration */}
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(0,154,171,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            top: 60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(0,154,171,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -60,
            bottom: -60,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(0,154,171,0.04)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 80px 56px",
            height: "100%",
          }}
        >
          {/* Top: logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Play triangle */}
            <div
              style={{
                width: 52,
                height: 52,
                background: "#009AAB",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "11px solid transparent",
                  borderBottom: "11px solid transparent",
                  borderLeft: "18px solid white",
                  marginLeft: 4,
                  display: "flex",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
                DentalMonitoring
              </span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Smarter Orthodontics</span>
            </div>
          </div>

          {/* Center: main headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 3, background: "#009AAB", borderRadius: 2, display: "flex" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#009AAB", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Sales Enablement
              </span>
            </div>
            <div style={{ fontSize: 62, fontWeight: 800, color: "#111827", lineHeight: 1.1, letterSpacing: "-1.5px", display: "flex", flexDirection: "column" }}>
              <span>Sales Objections</span>
              <span style={{ color: "#009AAB" }}>Evidence Hub</span>
            </div>
            <p style={{ fontSize: 22, color: "#6B7280", lineHeight: 1.5, margin: 0, fontWeight: 400 }}>
              Evidence-backed responses to the most common objections — data, studies, and testimonials in one place.
            </p>
          </div>

          {/* Bottom: stat pills */}
          <div style={{ display: "flex", gap: 12 }}>
            {["Clinical Data", "Peer-Reviewed Studies", "Real-World ROI", "Patient Outcomes"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(0,154,171,0.08)",
                  border: "1.5px solid rgba(0,154,171,0.2)",
                  borderRadius: 100,
                  padding: "8px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#009AAB",
                  display: "flex",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
