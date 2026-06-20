import { useState } from 'react';
import { PIECE_SETS, PIECE_STYLE_NAMES, PIECE_STYLE_LABELS } from '../lib/pieceSets.js';

const THEME_SWATCHES = [
  { name: 'watermelon', label: 'Watermelon', dark: '#095256', light: '#86a873' },
  { name: 'strawberry', label: 'Strawberry', dark: '#ae4242', light: '#fba9ab' },
  { name: 'banana', label: 'Banana', dark: '#a58f40', light: '#ebdf7a' },
  { name: 'blueberry', label: 'Blueberry', dark: '#0092d6', light: '#cfd1c2' },
];

export default function HomeScreen({ socket, theme, onThemeChange, pieceStyle, onPieceStyleChange }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toLowerCase();
    if (!trimmedName) { setError('Please enter your name.'); return; }

    setError('');
    if (trimmedCode) {
      socket.emit('join_room', { name: trimmedName, code: trimmedCode });
    } else {
      socket.emit('create_room', { name: trimmedName });
    }
  };

  const btnLabel = code.trim() ? 'Join Room' : 'Create Room';

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
        width: 'min(92vw, 618px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: 'clamp(20px, 6vw, 32px) clamp(16px, 6vw, 40px) clamp(24px, 6vw, 36px)',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        <h1 style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(24px, 8vw, 56px)',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: '#121212',
          lineHeight: 1,
          marginBottom: 24,
          overflowWrap: 'break-word',
          textAlign: 'center',
        }}>
          Game Of Chess
        </h1>

        {/* Board theme picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: '#121212', flexShrink: 0 }}>
            Board Theme:
          </span>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {THEME_SWATCHES.map(({ name: n, label, dark, light }) => {
              const isActive = theme === n;
              return (
                <button
                  key={n}
                  onClick={() => onThemeChange(n)}
                  title={label}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    width: 32, height: 32,
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
                    outline: isActive ? '2px solid #121212' : '1px solid rgba(18,18,18,0.3)',
                    outlineOffset: 2,
                  }}>
                    <div style={{ background: dark }} />
                    <div style={{ background: light }} />
                    <div style={{ background: light }} />
                    <div style={{ background: dark }} />
                  </div>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#121212' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Piece style picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: '#121212', flexShrink: 0 }}>
            Chess Piece Type:
          </span>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {PIECE_STYLE_NAMES.map((styleName) => {
              const isActive = pieceStyle === styleName;
              const previewSrc = PIECE_SETS[styleName].wn;
              return (
                <button
                  key={styleName}
                  onClick={() => onPieceStyleChange(styleName)}
                  title={PIECE_STYLE_LABELS[styleName]}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: isActive ? '2px solid #121212' : '1px solid rgba(18,18,18,0.3)',
                    outlineOffset: 2,
                    background: isActive ? 'var(--accent)' : 'transparent',
                  }}>
                    <img src={previewSrc} alt={PIECE_STYLE_LABELS[styleName]} style={{ height: 26, width: 'auto', maxWidth: '75%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#121212' }}>{PIECE_STYLE_LABELS[styleName]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={24}
          />
          <input
            type="text"
            placeholder="Enter Room Code (leave blank to create)"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={32}
            style={{ textTransform: 'lowercase' }}
          />
        </div>

        {error && (
          <p style={{ color: '#c00', fontFamily: 'Poppins, sans-serif', fontSize: 14, marginBottom: 8 }}>{error}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button className="btn-primary" onClick={handleSubmit} style={{ fontSize: 20, padding: '8px 24px' }}>
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
