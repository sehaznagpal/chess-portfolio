import { PIECE_SETS } from '../lib/pieceSets.js';

const OPTIONS = ['q', 'r', 'b', 'n'];
const LABELS = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

export default function PromotionPicker({ color, onPick, pieceStyle = 'geometric' }) {
  const set = PIECE_SETS[pieceStyle] || PIECE_SETS.geometric;
  const colorChar = color === 'white' ? 'w' : 'b';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(18,18,18,0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300,
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '2px solid var(--ink)',
        padding: '24px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <p style={{ fontFamily: 'Atelier, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>
          Promote Pawn
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onPick(opt)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '10px 14px', border: '1.5px solid var(--ink)',
                background: 'var(--surface)', cursor: 'pointer',
              }}
            >
              <img src={set[colorChar + opt]} alt={LABELS[opt]} style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>{LABELS[opt]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
