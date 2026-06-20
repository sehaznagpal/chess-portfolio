import { useState } from 'react';

export default function WaitingScreen({ roomCode, onCancel }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#cfd1c2',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid #121212',
        width: 'min(90vw, 540px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: 'clamp(24px, 6vw, 40px) clamp(16px, 6vw, 48px) clamp(24px, 6vw, 36px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(22px, 4vw, 40px)',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: '#121212',
          lineHeight: 1,
          marginBottom: 8,
          overflowWrap: 'break-word',
        }}>
          Room Created
        </h1>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: 'rgba(18,18,18,0.6)', marginBottom: 28 }}>
          Share this code with your opponent
        </p>

        {/* Room code display */}
        <div
          onClick={copyCode}
          title="Click to copy"
          style={{
            background: 'rgba(18,18,18,0.06)',
            border: 'none',
            borderRadius: 0,
            padding: '14px clamp(12px, 4vw, 28px)',
            maxWidth: '100%',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
            fontSize: 'clamp(16px, 3vw, 30px)',
            letterSpacing: '0.1em',
            color: '#121212',
            cursor: 'pointer',
            userSelect: 'all',
            marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 12,
            flexWrap: 'wrap', justifyContent: 'center',
          }}
        >
          {roomCode}
          <span style={{ fontSize: 18, opacity: 0.5 }}>📋</span>
        </div>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: copied ? '#2a8f2a' : 'rgba(18,18,18,0.4)', marginBottom: 32, height: 18 }}>
          {copied ? 'Copied!' : 'Click to copy'}
        </p>

        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17, color: 'rgba(18,18,18,0.7)', marginBottom: 28 }}>
          Waiting for opponent…
        </p>

        <button onClick={onCancel} style={{ fontSize: 16, padding: '6px 20px', opacity: 0.6 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
