import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareCardBaseProps {
  title: string;
  children: React.ReactNode;
  qrValue: string;
  subtitle?: string;
}

/**
 * The share card is rasterized by html2canvas, which can't parse Tailwind's
 * `color-mix()` opacity utilities or CSS variables reliably — so this component
 * deliberately uses plain inline styles with explicit hex (Celestial Noir).
 */
const GOLD = "#c9a227";
const GOLD_SOFT = "#e6c75c";
const OBSIDIAN = "#0b0b0f";
const TEXT = "#f4f1ea";

const ShareCardBase: React.FC<ShareCardBaseProps> = ({
  title,
  children,
  qrValue,
  subtitle,
}) => (
  <div
    style={{
      backgroundColor: OBSIDIAN,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      border: `1px solid ${GOLD}55`,
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${GOLD_SOFT}, ${GOLD})`,
      }}
    />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          border: `1.5px solid ${GOLD}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: GOLD, fontWeight: 700, fontSize: 18 }}>八</span>
      </div>
      <span style={{ color: TEXT, fontWeight: 700, fontSize: 20 }}>BaziGPT</span>
    </div>

    <h3
      style={{
        color: GOLD,
        fontSize: 22,
        fontWeight: 700,
        margin: "0 0 16px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      {title}
    </h3>

    {subtitle && (
      <p style={{ color: TEXT, fontSize: 14, marginBottom: 16 }}>{subtitle}</p>
    )}

    <div style={{ width: "100%", textAlign: "center", color: TEXT }}>
      {children}
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
      }}
    >
      <span style={{ color: GOLD, fontWeight: 600, fontSize: 12 }}>
        Get your own reading at bazigpt.io
      </span>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <QRCodeSVG
          value={qrValue}
          size={40}
          level="M"
          fgColor={GOLD}
          bgColor="transparent"
        />
        <span style={{ color: TEXT, fontSize: 11, marginTop: 4 }}>
          Scan to get your reading
        </span>
      </div>
    </div>
  </div>
);

export default ShareCardBase;
