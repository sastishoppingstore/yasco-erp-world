// 3D QR React component (visual only - underlying QR remains ZATCA TLV Base64 compliant)
import React from 'react';

interface ZatcaQr3DProps {
  qrData: string;
  primaryColor?: string;
  secondaryColor?: string;
  size?: number;
}

export const ZatcaQr3D: React.FC<ZatcaQr3DProps> = ({
  qrData,
  primaryColor = '#1a5f7a',
  secondaryColor = '#159895',
  size = 150,
}) => (
  <div
    style={{
      display: 'inline-block',
      padding: '16px',
      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      borderRadius: '12px',
      boxShadow: '4px 8px 16px rgba(0,0,0,0.15)',
    }}
  >
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)',
      }}
    >
      {/* Replace with your QRCodeSVG or react-qr-code */}
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`}
        width={size}
        height={size}
        alt="ZATCA QR"
        style={{ borderRadius: '4px' }}
      />
    </div>
    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#fff' }}>
      امسح للتحقق / Scan to Verify
    </div>
  </div>
);
