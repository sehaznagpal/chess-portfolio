import { useState } from 'react';
import { PIECE_SETS, PIECE_STYLE_NAMES, PIECE_STYLE_LABELS } from '../lib/pieceSets.js';

// Internal theme keys/values are unchanged — these are just the new
// display labels for the existing watermelon/strawberry/banana/blueberry
// theme tokens.
const THEME_SWATCHES = [
  { name: 'watermelon', label: 'Matcha', dark: '#095256', light: '#86a873' },
  { name: 'strawberry', label: 'Strawberry', dark: '#ae4242', light: '#fba9ab' },
  { name: 'banana', label: 'Sunshine', dark: '#a58f40', light: '#ebdf7a' },
  { name: 'blueberry', label: 'Beach', dark: '#0092d6', light: '#cfd1c2' },
];

const checkerStripStyle = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  height: 'clamp(28px, 5vh, 48px)',
  backgroundColor: '#1e1e1e',
  backgroundImage: 'repeating-conic-gradient(#1e1e1e 0% 25%, #f5f5f5 0% 50%)',
  backgroundSize: 'clamp(22px, 3vw, 40px) clamp(22px, 3vw, 40px)',
};

export default function HomeScreen({
  socket, theme, onThemeChange, pieceStyle, onPieceStyleChange,
  isWaiting, roomCode, onCancelWaiting,
}) {
  const [mode, setMode] = useState('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setName('');
    setCode('');
    setError('');
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) { setError('Please enter your name.'); return; }

    if (mode === 'join') {
      const trimmedCode = code.trim().toLowerCase();
      if (!trimmedCode) { setError('Please enter a room code.'); return; }
      setError('');
      socket.emit('join_room', { name: trimmedName, code: trimmedCode });
    } else {
      setError('');
      socket.emit('create_room', { name: trimmedName });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f5f5f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(16px, 4vw, 40px)',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'stretch', justifyContent: 'center',
        gap: 'clamp(20px, 4vw, 40px)',
        maxWidth: 1280,
        position: 'relative',
      }}>

        {/* ── Create or Join box ──────────────────────────────────── */}
        <div className="grain-texture" style={{
          position: 'relative',
          background: '#161616',
          border: '4px solid #121212',
          width: 'min(94vw, 480px)',
          boxSizing: 'border-box',
          padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 36px)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Create / Join segmented toggle */}
          <div style={{
            display: 'flex',
            border: '2px solid #f5f5f5',
            margin: '0 0 clamp(20px, 4vw, 32px)',
            position: 'relative', zIndex: 1,
          }}>
            <button
              onClick={() => switchMode('create')}
              disabled={isWaiting}
              style={{
                flex: 1, border: 'none', padding: 'clamp(8px, 1.4vw, 12px) 0',
                fontFamily: 'Atelier, sans-serif',
                fontSize: 'clamp(16px, 2vw, 20px)',
                background: mode === 'create' ? '#f5f5f5' : 'transparent',
                color: mode === 'create' ? '#161616' : 'rgba(245,245,245,0.45)',
              }}
            >
              Create
            </button>
            <button
              onClick={() => switchMode('join')}
              disabled={isWaiting}
              style={{
                flex: 1, borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                borderLeft: '2px solid #f5f5f5', padding: 'clamp(8px, 1.4vw, 12px) 0',
                fontFamily: 'Atelier, sans-serif',
                fontSize: 'clamp(16px, 2vw, 20px)',
                background: mode === 'join' ? '#f5f5f5' : 'transparent',
                color: mode === 'join' ? '#161616' : 'rgba(245,245,245,0.45)',
              }}
            >
              Join
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12, position: 'relative', zIndex: 1 }}>
            <input
              type="text"
              className="input-on-dark"
              placeholder="Enter Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={24}
              disabled={isWaiting}
              style={{ background: 'transparent', borderColor: '#f5f5f5', color: '#f5f5f5' }}
            />
            <input
              type="text"
              className="input-on-dark"
              placeholder={mode === 'join' ? 'Enter Room Code' : 'Enter Room Name'}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={32}
              disabled={isWaiting}
              style={{ background: 'transparent', borderColor: '#f5f5f5', color: '#f5f5f5', textTransform: 'lowercase' }}
            />

            {mode === 'create' && (isWaiting ? (
              /* Real room code/link now that one exists, shown right here
                 instead of navigating to a separate screen. */
              <div
                onClick={copyCode}
                title="Click to copy"
                style={{
                  fontFamily: 'monospace', fontSize: 16, color: '#f5f5f5',
                  padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', border: '1px solid rgba(245,245,245,0.4)',
                  flexWrap: 'wrap',
                }}
              >
                {roomCode}
                <span style={{ fontSize: 13, opacity: 0.75 }}>{copied ? 'Copied!' : '📋 click to copy'}</span>
              </div>
            ) : (
              /* Decorative placeholder — becomes the real code/link above
                 once a room exists. */
              <div style={{
                fontFamily: 'monospace', fontSize: 16, color: 'rgba(245,245,245,0.45)',
                padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {'<Link>'}
                <span style={{ fontSize: 13, opacity: 0.7 }}>appears after creating a room</span>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: '#ff9b9b', fontFamily: 'Poppins, sans-serif', fontSize: 14, marginBottom: 8, position: 'relative', zIndex: 1 }}>{error}</p>
          )}

          {isWaiting && (
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'rgba(245,245,245,0.8)', margin: '0 0 8px', position: 'relative', zIndex: 1 }}>
              Waiting for opponent…
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: 16, position: 'relative', zIndex: 1 }}>
            {isWaiting ? (
              <button
                onClick={onCancelWaiting}
                style={{
                  fontSize: 'clamp(16px, 2.2vw, 20px)', padding: '8px 24px',
                  background: 'transparent', color: '#f5f5f5', border: '1px solid #f5f5f5',
                }}
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  fontSize: 'clamp(16px, 2.2vw, 20px)', padding: '8px 24px',
                  background: '#f5f5f5', color: '#161616', border: '1px solid #f5f5f5',
                }}
              >
                {mode === 'join' ? 'Join Room' : 'Create Room'}
              </button>
            )}
          </div>
        </div>

        {/* ── Customise box ───────────────────────────────────────── */}
        <div className="grain-texture" style={{
          position: 'relative',
          background: '#161616',
          border: '2px solid #121212',
          width: 'min(94vw, 480px)',
          boxSizing: 'border-box',
          padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 36px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'Atelier, sans-serif',
            fontSize: 'clamp(26px, 5vw, 40px)',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            color: '#f5f5f5',
            lineHeight: 1,
            margin: '0 0 clamp(20px, 4vw, 32px)',
            position: 'relative', zIndex: 1,
          }}>
            Customise
          </h2>

          {/* Board theme picker */}
          <div style={{ marginBottom: 20, position: 'relative', zIndex: 1, width: '100%' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(14px, 2vw, 16px)', color: '#f5f5f5', margin: '0 0 10px', textAlign: 'center' }}>
              Board Theme:
            </p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
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
                      width: 30, height: 30,
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
                      outline: isActive ? '2px solid #f5f5f5' : '1px solid rgba(245,245,245,0.4)',
                      outlineOffset: 2,
                    }}>
                      <div style={{ background: dark }} />
                      <div style={{ background: light }} />
                      <div style={{ background: light }} />
                      <div style={{ background: dark }} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: '#f5f5f5', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Piece style picker */}
          <div style={{ marginBottom: 12, position: 'relative', zIndex: 1, width: '100%' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(14px, 2vw, 16px)', color: '#f5f5f5', margin: '0 0 10px', textAlign: 'center' }}>
              Chess Piece Type:
            </p>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
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
                      width: 34, height: 34,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      outline: isActive ? '2px solid #f5f5f5' : '1px solid rgba(245,245,245,0.4)',
                      outlineOffset: 2,
                      background: isActive ? 'rgba(245,245,245,0.18)' : 'transparent',
                    }}>
                      <img src={previewSrc} alt={PIECE_STYLE_LABELS[styleName]} style={{ height: 24, width: 'auto', maxWidth: '75%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: '#f5f5f5', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{PIECE_STYLE_LABELS[styleName]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: 16, position: 'relative', zIndex: 1, width: '100%' }}>
            <button
              onClick={handleSubmit}
              style={{
                fontSize: 'clamp(16px, 2.2vw, 20px)', padding: '8px 24px',
                background: '#f5f5f5', color: '#161616', border: '1px solid #f5f5f5',
              }}
            >
              Enter Room
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal checker strip along the bottom */}
      <div style={checkerStripStyle} />
    </div>
  );
}
