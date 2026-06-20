import Piece from './Piece.jsx';

export default function Square({
  file, rank, piece, isLight, isSelected, isLegalMove, isCapture, isLastMove,
  isCheckKing, isCheckmateKing, showGuide, showLabels, playerColor, onSquareClick, pieceStyle,
}) {
  const sq = `${file}${rank}`;

  let bg = isLight ? 'var(--boardLight)' : 'var(--boardDark)';
  let outline = 'none';
  let boxShadow = 'none';

  if (isCheckmateKing) {
    // Same red used for "capturable" squares, but at half visibility —
    // the king is in checkmate, not merely threatened.
    bg = 'rgba(131, 4, 6, 0.5)';
    outline = '2px solid #121212';
  } else if (isCheckKing) {
    bg = '#830406';
    outline = '2px solid #121212';
  } else if (isSelected) {
    outline = '4px solid #121212';
    boxShadow = 'inset 0 0 20px 10px rgba(0,0,0,0.25)';
  } else if (showGuide && isCapture) {
    bg = '#830406';
    outline = '2px solid #121212';
  } else if (showGuide && isLegalMove) {
    bg = '#f5f5f5';
    outline = '2px solid #121212';
  } else if (isLastMove) {
    outline = '2px solid rgba(193,255,64,0.7)';
  }

  // Labels: file on bottom row, rank on leftmost column (from player's perspective)
  const bottomRank = playerColor === 'white' ? 1 : 8;
  const leftFile  = playerColor === 'white' ? 'a' : 'h';
  const showFileLabel = showLabels && rank === bottomRank;
  const showRankLabel = showLabels && file === leftFile;

  const labelStyle = {
    position: 'absolute',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 'calc(var(--board-size) / 8 * 0.22)',
    fontWeight: 500,
    color: isLight ? 'var(--boardDark)' : 'var(--boardLight)',
    lineHeight: 1,
    pointerEvents: 'none',
    userSelect: 'none',
  };

  return (
    <div
      onClick={() => onSquareClick(sq)}
      style={{
        position: 'relative',
        background: bg,
        outline,
        outlineOffset: outline !== 'none' ? '-2px' : undefined,
        boxSizing: 'border-box',
        boxShadow,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {piece && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          height: '100%',
        }}>
          <Piece color={piece.color} type={piece.type} pieceStyle={pieceStyle} />
        </div>
      )}

      {showFileLabel && (
        <span style={{ ...labelStyle, bottom: '3%', right: '5%' }}>{file}</span>
      )}
      {showRankLabel && (
        <span style={{ ...labelStyle, top: '5%', left: '5%' }}>{rank}</span>
      )}
    </div>
  );
}
