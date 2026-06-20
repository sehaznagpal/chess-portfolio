import { PIECE_SETS, PIECE_HEIGHT_PCT } from '../lib/pieceSets.js';

export default function Piece({ color, type, pieceStyle = 'geometric' }) {
  const key = `${color}${type}`;
  const set = PIECE_SETS[pieceStyle] || PIECE_SETS.geometric;
  const src = set[key];
  if (!src) return null;

  const heightPct = (PIECE_HEIGHT_PCT[pieceStyle] || PIECE_HEIGHT_PCT.geometric)[type] || '75%';

  return (
    <img
      src={src}
      alt={`${color}${type}`}
      draggable={false}
      style={{
        height: heightPct,
        width: 'auto',
        maxWidth: '80%',
        objectFit: 'contain',
        userSelect: 'none',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
