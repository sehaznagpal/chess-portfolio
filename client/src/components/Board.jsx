import { Chess } from 'chess.js';
import Square from './Square.jsx';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

function parseFen(fen) {
  // Returns a map of square → { color, type }
  const chess = new Chess(fen);
  const map = {};
  for (const file of FILES) {
    for (const rank of RANKS) {
      const sq = `${file}${rank}`;
      const p = chess.get(sq);
      if (p) map[sq] = p;
    }
  }
  return map;
}

export default function Board({
  fen,
  playerColor,
  selectedSq,
  legalMoves,
  showLabels,
  showGuide,
  lastMove,
  onSquareClick,
  pieceStyle,
}) {
  const boardSize = 'var(--board-size)';
  const pieces = parseFen(fen);

  const legalDests = new Set((legalMoves || []).map(m => m.to));
  const captureSet = new Set(
    (legalMoves || [])
      .filter(m => pieces[m.to] && pieces[m.to].type !== 'k')
      .map(m => m.to)
  );

  const files = playerColor === 'black' ? [...FILES].reverse() : FILES;
  const ranks = playerColor === 'black' ? [...RANKS].reverse() : RANKS;

  return (
    <div
      style={{
        width: boardSize,
        height: boardSize,
        border: '3.4px solid var(--boardBorder)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        flexShrink: 0,
      }}
    >
      {ranks.map((rank) =>
        files.map((file) => {
          const sq = `${file}${rank}`;
          const fileIdx = FILES.indexOf(file);
          const rankIdx = RANKS.indexOf(rank);
          const isLight = (fileIdx + rankIdx) % 2 !== 0;
          const piece = pieces[sq] || null;
          const isSelected = selectedSq === sq;
          const isLegalMove = showGuide && legalDests.has(sq) && !captureSet.has(sq) && !piece;
          const isCapture = showGuide && captureSet.has(sq);
          const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);

          return (
            <Square
              key={sq}
              file={file}
              rank={rank}
              piece={piece}
              isLight={isLight}
              isSelected={isSelected}
              isLegalMove={isLegalMove}
              isCapture={isCapture}
              isLastMove={isLastMove}
              showGuide={showGuide}
              showLabels={showLabels}
              playerColor={playerColor}
              onSquareClick={onSquareClick}
              pieceStyle={pieceStyle}
            />
          );
        })
      )}
    </div>
  );
}
