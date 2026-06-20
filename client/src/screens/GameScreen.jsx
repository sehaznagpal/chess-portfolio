import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board.jsx';
import HelpModal from '../components/HelpModal.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import PromotionPicker from '../components/PromotionPicker.jsx';
import CapturedPieces from '../components/CapturedPieces.jsx';

function GearIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

export default function GameScreen({
  socket, fen, playerColor, playerName, opponentName,
  myPoints, opponentPoints, myCaptured, opponentCaptured,
  turn, lastMove, onResign, pieceStyle,
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [selectedSq, setSelectedSq] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [illegalMsg, setIllegalMsg] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const illegalTimer = useRef(null);
  const settingsRef = useRef(null);

  const chess = new Chess(fen);

  // Close settings when clicking outside (no z-index warfare)
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  const showIllegalMessage = useCallback((msg = 'Illegal move') => {
    setIllegalMsg(msg);
    clearTimeout(illegalTimer.current);
    illegalTimer.current = setTimeout(() => setIllegalMsg(null), 2000);
  }, []);

  const handleSquareClick = useCallback((sq) => {
    const myTurn = (playerColor === 'white' && chess.turn() === 'w') ||
                   (playerColor === 'black' && chess.turn() === 'b');

    if (selectedSq) {
      if (sq === selectedSq) {
        setSelectedSq(null); setLegalMoves([]); return;
      }
      const isLegal = legalMoves.some(m => m.to === sq);
      if (isLegal) {
        const piece = chess.get(selectedSq);
        const isPawnPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && sq[1] === '8') || (piece.color === 'b' && sq[1] === '1'));
        if (isPawnPromotion) {
          setPendingPromotion({ from: selectedSq, to: sq });
          setSelectedSq(null); setLegalMoves([]); return;
        }
        socket.emit('make_move', { from: selectedSq, to: sq });
        setSelectedSq(null); setLegalMoves([]); return;
      }
      const piece = chess.get(sq);
      if (myTurn && piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSq(sq);
        setLegalMoves(chess.moves({ square: sq, verbose: true }));
        return;
      }
      setSelectedSq(null); setLegalMoves([]); return;
    }

    if (!myTurn) return;
    const piece = chess.get(sq);
    if (!piece || piece.color !== (playerColor === 'white' ? 'w' : 'b')) return;
    const moves = chess.moves({ square: sq, verbose: true });
    if (moves.length === 0) return;
    setSelectedSq(sq);
    setLegalMoves(moves);
  }, [selectedSq, legalMoves, fen, playerColor, chess, socket]);

  const handlePromotion = (promotionPiece) => {
    if (!pendingPromotion) return;
    socket.emit('make_move', { ...pendingPromotion, promotion: promotionPiece });
    setPendingPromotion(null);
  };

  const myTurn = (playerColor === 'white' && chess.turn() === 'w') ||
                 (playerColor === 'black' && chess.turn() === 'b');

  // Net point difference: positive = I'm winning material, negative = losing
  const netPoints = myPoints - opponentPoints;
  const netDisplay = netPoints >= 0 ? `+${netPoints}` : `${netPoints}`;
  const pillBg = netPoints >= 0 ? 'var(--accent)' : '#EE5151';
  const pillColor = netPoints >= 0 ? 'var(--ink)' : '#fff';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bgLight)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Noise overlay */}
      <div className="game-noise-overlay" />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>

        {/* ── Top bar ────────────────────────────────────────── */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '14px 20px 6px', flexShrink: 0, gap: 6 }}>

          {/* Resign X — top left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setShowResignConfirm(true)}
              title="Resign"
              style={{
                background: 'transparent', border: '1.5px solid var(--ink)',
                color: 'var(--ink)', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: 4, fontSize: 18, fontWeight: 700,
                lineHeight: 1, flexShrink: 0,
              }}
            >✕</button>
            {opponentPoints > 0 && (
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#EE5151', fontWeight: 600, whiteSpace: 'nowrap' }}>
                +{opponentPoints} pts
              </span>
            )}
          </div>

          {/* Opponent name */}
          <span style={{
            flex: 1, minWidth: 0, textAlign: 'center',
            fontFamily: 'Atelier, sans-serif', fontSize: 'clamp(16px, 2.5vw, 30px)', textTransform: 'uppercase', color: 'var(--ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {opponentName || 'Opponent'}
          </span>

          {/* Right: ? and gear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              className="btn-round"
              onClick={() => setShowHelp(true)}
              style={{ background: 'var(--accent2)', color: '#f5f5f5', border: '1.5px solid var(--ink)', fontFamily: 'Atelier, sans-serif', fontSize: 22, width: 40, height: 40, padding: 0, borderRadius: '50%', flexShrink: 0 }}
            >?</button>
            <div ref={settingsRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowSettings(s => !s)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink)', padding: 4, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <GearIcon />
              </button>
              {showSettings && (
                <SettingsPanel
                  showLabels={showLabels}
                  showGuide={showGuide}
                  onToggleLabels={() => setShowLabels(v => !v)}
                  onToggleGuide={() => setShowGuide(v => !v)}
                  onClose={() => setShowSettings(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Opponent's captured pieces (what they took from me) */}
        <div style={{ width: 'var(--board-size)', display: 'flex', alignItems: 'center', paddingLeft: 4, marginBottom: 2, minHeight: 20, flexShrink: 0 }}>
          <CapturedPieces pieces={opponentCaptured} pieceStyle={pieceStyle} />
        </div>

        {/* Turn indicator */}
        <div style={{ height: 18, marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {myTurn
            ? <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--ink)', fontWeight: 600, letterSpacing: 0.5 }}>YOUR TURN</span>
            : <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'rgba(18,18,18,0.45)' }}>Opponent's turn…</span>
          }
        </div>

        {/* Board */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Board
            fen={fen}
            playerColor={playerColor}
            selectedSq={selectedSq}
            legalMoves={legalMoves}
            showLabels={showLabels}
            showGuide={showGuide}
            lastMove={lastMove}
            onSquareClick={handleSquareClick}
            pieceStyle={pieceStyle}
          />
          {illegalMsg && (
            <div style={{ position: 'absolute', bottom: -34, left: '50%', transform: 'translateX(-50%)', background: '#830406', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 13, padding: '4px 16px', borderRadius: 4, whiteSpace: 'nowrap', zIndex: 10 }}>
              {illegalMsg}
            </div>
          )}
        </div>

        {/* My captured pieces (what I took from opponent) */}
        <div style={{ width: 'var(--board-size)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, marginTop: 2, minHeight: 20, flexShrink: 0 }}>
          <CapturedPieces pieces={myCaptured} pieceStyle={pieceStyle} />
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '6px 20px 14px', flexShrink: 0, gap: 6 }}>
          <span style={{
            flex: 1, minWidth: 0, textAlign: 'center',
            fontFamily: 'Atelier, sans-serif', fontSize: 'clamp(16px, 2.5vw, 30px)', textTransform: 'uppercase', color: 'var(--ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {playerName || 'You'}
          </span>

          {/* Net points pill */}
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
            background: pillBg, border: `1.5px solid ${netPoints < 0 ? '#c04040' : 'var(--ink)'}`,
            padding: '4px 8px',
          }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: pillColor, fontWeight: 500, whiteSpace: 'nowrap' }}>My Points</span>
            <span style={{ fontFamily: 'Atelier, sans-serif', fontSize: 18, textTransform: 'uppercase', color: pillColor, whiteSpace: 'nowrap' }}>
              {netDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* ── Overlays ────────────────────────────────────────── */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} pieceStyle={pieceStyle} />}
      {pendingPromotion && <PromotionPicker color={playerColor} onPick={handlePromotion} pieceStyle={pieceStyle} />}

      {/* Resign confirmation */}
      {showResignConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(18,18,18,0.55)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface)', padding: '32px 40px', textAlign: 'center',
            border: '2px solid var(--ink)',
          }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, color: 'var(--ink)', marginBottom: 24, lineHeight: 1.4 }}>
              Are you sure you want to resign?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => { onResign(); setShowResignConfirm(false); }}
                style={{ fontSize: 16, padding: '8px 20px', background: '#EE5151', borderColor: '#c04040', color: '#fff' }}
              >
                Yes, resign
              </button>
              <button
                onClick={() => setShowResignConfirm(false)}
                style={{ fontSize: 16, padding: '8px 20px' }}
              >
                No, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
