import { PIECE_SETS } from '../lib/pieceSets.js';

export default function CapturedPieces({ pieces, pieceStyle = 'geometric' }) {
  if (!pieces || pieces.length === 0) return null;
  const set = PIECE_SETS[pieceStyle] || PIECE_SETS.geometric;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      {pieces.map((p, i) => {
        const src = set[p];
        if (!src) return null;
        return (
          <img
            key={i}
            src={src}
            alt={p}
            draggable={false}
            style={{
              height: 22,
              width: 'auto',
              opacity: 0.85,
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'block',
            }}
          />
        );
      })}
    </div>
  );
}
