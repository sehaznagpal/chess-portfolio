import { PIECE_SETS } from '../lib/pieceSets.js';

const PIECES = [
  {
    type: 'n', name: 'Knight', points: '3',
    desc: 'Moves in an L-shape (2 squares one way, 1 the other). The only piece that can jump over others. Very sneaky.',
  },
  {
    type: 'b', name: 'Bishop', points: '3',
    desc: 'Slides diagonally any number of squares. Each bishop is color-blind and stays on its starting color forever.',
  },
  {
    type: 'r', name: 'Rook', points: '5',
    desc: 'Slides horizontally or vertically any number of squares. Can castle with the king. Very straight, very reliable.',
  },
  {
    type: 'q', name: 'Queen', points: '9',
    desc: 'Moves any number of squares in any direction. The most powerful piece on the board. Do not lose her.',
  },
  {
    type: 'k', name: 'King', points: '—',
    desc: 'Moves one square in any direction. Cannot move into check. Protect at all costs. Losing the king ends everything.',
  },
  {
    type: 'p', name: 'Pawn', points: '1',
    desc: 'Moves forward 1 square (or 2 on the first move). Captures diagonally. Reaches the far rank and becomes anything it wants.',
  },
];

export default function HelpModal({ onClose, pieceStyle = 'geometric' }) {
  const set = PIECE_SETS[pieceStyle] || PIECE_SETS.geometric;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(18,18,18,0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(18,18,18,0.85)',
          border: '4px solid #fff',
          borderRadius: 20,
          padding: '24px 32px',
          width: 'min(92vw, 860px)',
          maxHeight: '88vh',
          overflowY: 'auto',
          position: 'relative',
          color: '#f5f5f5',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 16,
            background: 'transparent', border: 'none',
            color: '#f5f5f5', fontSize: 28, cursor: 'pointer',
            fontFamily: 'Atelier, sans-serif', lineHeight: 1,
            padding: '0 6px',
          }}
        >✕</button>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Piece', 'Description', 'Points'].map(h => (
                <th key={h} style={{
                  padding: '6px 12px', textAlign: 'left',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                  fontSize: 18, borderBottom: '2px solid rgba(255,255,255,0.25)',
                  color: '#f5f5f5',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PIECES.map(({ type, name, points, desc }) => (
              <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={set['w' + type]} alt={name} style={{ width: 32, height: 52, objectFit: 'contain', objectPosition: 'center bottom', display: 'block' }} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: '#f5f5f5', whiteSpace: 'nowrap' }}>{name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'rgba(245,245,245,0.85)', lineHeight: 1.5 }}>
                  {desc}
                </td>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'var(--accent)', color: 'var(--ink)',
                    fontFamily: 'Atelier, sans-serif', fontSize: 20,
                    padding: '4px 14px', borderRadius: 999,
                    border: '1px solid var(--ink)',
                  }}>{points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
