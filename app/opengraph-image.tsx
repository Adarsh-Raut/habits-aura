import { ImageResponse } from "next/og";

export const alt = "Habits Aura: build habits, grow your aura";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f5f2",
          color: "#0b0b0c",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#0b0b0c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 24,
                border: "6px solid #ff4d1a",
              }}
            />
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Habits Aura</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 36 }}>
          <div
            style={{
              fontSize: 330,
              fontWeight: 900,
              lineHeight: 0.8,
              letterSpacing: -20,
            }}
          >
            47
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ff4d1a",
              paddingBottom: 8,
            }}
          >
            days in a row
          </div>
        </div>

        <div style={{ fontSize: 44, fontWeight: 800 }}>
          Build habits. Grow your aura.
        </div>
      </div>
    ),
    size,
  );
}
