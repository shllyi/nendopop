import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#ff8c00",
        padding: "24px 16px",
        color: "white",
        textAlign: "center",
        marginTop: 48,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600 }}>Nendopop</div>
      <div style={{ marginTop: 8, fontSize: 14 }}>
        Bringing the cutest Nendoroids to your collection.
      </div>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
        © {new Date().getFullYear()} Nendopop. All rights reserved.
      </div>
    </footer>
  );
}
