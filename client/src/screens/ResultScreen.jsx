const OUTCOME_TEXT = {
  win: 'YOU WIN!',
  lose: 'YOU LOSE',
  draw: 'DRAW',
};

const REASON_TEXT = {
  checkmate: 'by checkmate',
  stalemate: 'stalemate',
  draw: 'draw',
  resignation: 'by resignation',
  unknown: '',
};

export default function ResultScreen({ outcome, reason, onPlayAgain, onHome, waitingForRematch }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#121212',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--surface)',
        width: 'min(90vw, 618px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        minHeight: 216,
        padding: 'clamp(24px, 6vw, 28px) clamp(16px, 6vw, 40px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0,
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(28px, 8vw, 64px)',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: '#121212',
          lineHeight: 1,
          marginBottom: 8,
          overflowWrap: 'break-word',
        }}>
          {OUTCOME_TEXT[outcome] || 'GAME OVER'}
        </h1>

        {reason && reason !== 'unknown' && (
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'rgba(18,18,18,0.55)', marginBottom: 20 }}>
            {REASON_TEXT[reason] || reason}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onPlayAgain}
            disabled={waitingForRematch}
            style={{
              fontSize: 18, padding: '6px 16px',
              background: waitingForRematch ? 'rgba(193,255,64,0.5)' : 'var(--accent)',
              border: '1px solid #121212',
              borderRadius: 0,
              opacity: waitingForRematch ? 0.7 : 1,
            }}
          >
            {waitingForRematch ? 'Waiting…' : 'Play Again'}
          </button>
          <button
            onClick={onHome}
            style={{
              fontSize: 18, padding: '6px 16px',
              background: 'transparent',
              border: '1px solid #121212',
              borderRadius: 0,
            }}
          >
            Home
          </button>
        </div>

        {waitingForRematch && (
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'rgba(18,18,18,0.5)', marginTop: 12 }}>
            Waiting for opponent to accept rematch…
          </p>
        )}
      </div>
    </div>
  );
}
