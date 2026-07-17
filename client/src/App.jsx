import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoadingScreen from './screens/LoadingScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultScreen from './screens/ResultScreen.jsx';
import { applyTheme } from './lib/themes.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
// Explicitly prefer WebSocket over the default polling-then-upgrade dance —
// without this, some environments never upgrade off HTTP long-polling, which
// turns every round trip (room creation, moves) into a multi-hundred-ms poll
// cycle instead of a near-instant push.
const socket = io(SERVER_URL, { autoConnect: false, transports: ['websocket', 'polling'] });

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const SESSION_TTL = 60 * 60 * 1000; // 60 minutes

// sessionStorage is private per browser tab (unlike localStorage, which is
// shared across every tab on the same origin) and survives a refresh, so we
// use it to mint a stable per-tab id. That id namespaces the localStorage
// key below, so two tabs in the same browser never clobber each other's
// saved game session.
function getTabId() {
  try {
    let id = sessionStorage.getItem('chess_tab_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('chess_tab_id', id);
    }
    return id;
  } catch {
    return 'default';
  }
}

const STORAGE_KEY = `chess_game_session_${getTabId()}`;

function saveSession(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.startedAt > SESSION_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// Theme/piece-style are personal display preferences, but they're still
// namespaced per-tab (like the game session) so two tabs in one browser
// testing as two different players don't stomp on each other's choice.
const THEME_KEY = `chess_theme_${getTabId()}`;
const PIECE_STYLE_KEY = `chess_piece_style_${getTabId()}`;

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'watermelon';
  } catch {
    return 'watermelon';
  }
}

function loadPieceStyle() {
  try {
    return localStorage.getItem(PIECE_STYLE_KEY) || 'geometric';
  } catch {
    return 'geometric';
  }
}

// The loading screen is a one-time welcome splash, not a real app state —
// it should never reappear on a refresh (that would risk looking like
// progress was lost). sessionStorage survives refresh but is private to
// this tab, so "seen once this tab" is exactly the right scope.
const INTRO_SEEN_KEY = 'chess_intro_seen';

function loadInitialScreen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) ? 'home' : 'loading';
  } catch {
    return 'loading';
  }
}

function markIntroSeen() {
  try { sessionStorage.setItem(INTRO_SEEN_KEY, '1'); } catch {}
}

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [pieceStyle, setPieceStyle] = useState(loadPieceStyle);
  const [screen, setScreen] = useState(loadInitialScreen);

  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [playerColor, setPlayerColor] = useState('white');
  const [fen, setFen] = useState(INITIAL_FEN);
  const [turn, setTurn] = useState('w');
  const [myPoints, setMyPoints] = useState(0);
  const [opponentPoints, setOpponentPoints] = useState(0);
  const [myCaptured, setMyCaptured] = useState([]);
  const [opponentCaptured, setOpponentCaptured] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [waitingForRematch, setWaitingForRematch] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => { applyTheme(theme); }, [theme]);

  // The loading screen only advances when its button is clicked — see
  // handleEnterFromLoading below. If a rejoin completes first (see the
  // socket effect below), it will have already moved us to 'game' itself.
  function handleEnterFromLoading() {
    markIntroSeen();
    setScreen(s => (s === 'loading' ? 'home' : s));
  }

  function handleThemeChange(t) {
    setTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  }

  function handlePieceStyleChange(style) {
    setPieceStyle(style);
    try { localStorage.setItem(PIECE_STYLE_KEY, style); } catch {}
  }

  // Connect, and re-announce ourselves to the server on every connection
  // (not just the first one). Tabs get throttled/suspended in the background
  // for minutes at a time, which can silently drop and reconnect the
  // underlying socket with a new id — without this, the server would think
  // the player vanished and eventually end the game out from under them.
  useEffect(() => {
    socket.connect();

    const tryRejoin = () => {
      const session = loadSession();
      if (session) {
        socket.emit('rejoin_room', { code: session.roomCode, color: session.playerColor });
      }
    };

    socket.on('connect', tryRejoin);
    if (socket.connected) tryRejoin();

    return () => {
      socket.off('connect', tryRejoin);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onRoomCreated = ({ code }) => {
      setRoomCode(code);
      setIsWaitingForOpponent(true);
      // Stay on the home screen — the room code now shows inline there.
    };

    const onJoinError = ({ message }) => showToast(message);

    const onGameStart = ({ roomCode: rc, playerColor: color, playerName: pName, opponentName: oName, fen: f }) => {
      setPlayerColor(color);
      setPlayerName(pName);
      setOpponentName(oName);
      setFen(f);
      setTurn('w');
      setMyPoints(0);
      setOpponentPoints(0);
      setMyCaptured([]);
      setOpponentCaptured([]);
      setLastMove(null);
      setGameResult(null);
      setWaitingForRematch(false);
      setRoomCode(rc);
      setIsWaitingForOpponent(false);
      setScreen('game');
      saveSession({ roomCode: rc, playerColor: color, playerName: pName, opponentName: oName, startedAt: Date.now() });
    };

    const onGameRejoined = ({
      roomCode: rc, playerColor: color, playerName: pName, opponentName: oName,
      fen: f, turn: t, whitePoints: wp, blackPoints: bp,
      whiteCaptured: wc, blackCaptured: bc, lastMove: lm, startedAt,
    }) => {
      setPlayerColor(color);
      setPlayerName(pName);
      setOpponentName(oName);
      setFen(f);
      setTurn(t);
      setLastMove(lm);
      setGameResult(null);
      setWaitingForRematch(false);
      setRoomCode(rc);
      if (color === 'white') {
        setMyPoints(wp);
        setOpponentPoints(bp);
        setMyCaptured(wc || []);
        setOpponentCaptured(bc || []);
      } else {
        setMyPoints(bp);
        setOpponentPoints(wp);
        setMyCaptured(bc || []);
        setOpponentCaptured(wc || []);
      }
      setScreen('game');
      // Refresh session with original startedAt so TTL stays correct
      saveSession({ roomCode: rc, playerColor: color, playerName: pName, opponentName: oName, startedAt });
      showToast('Game restored.');
    };

    const onRejoinError = () => {
      clearSession();
      showToast('Previous game has expired.');
    };

    const onMoveMade = ({ fen: f, turn: t, lastMove: lm, whitePoints: wp, blackPoints: bp, whiteCaptured: wc, blackCaptured: bc }) => {
      setFen(f);
      setTurn(t);
      setLastMove(lm);
      if (playerColor === 'white') {
        setMyPoints(wp);
        setOpponentPoints(bp);
        setMyCaptured(wc || []);
        setOpponentCaptured(bc || []);
      } else {
        setMyPoints(bp);
        setOpponentPoints(wp);
        setMyCaptured(bc || []);
        setOpponentCaptured(wc || []);
      }
    };

    const onGameOver = ({ outcome, reason }) => {
      clearSession();
      if (reason === 'checkmate') {
        // Let the board sit on the checkmate position (with the king's
        // square highlighted) for a bit before jumping to the result screen.
        setTimeout(() => {
          setGameResult({ outcome, reason });
          setScreen('result');
        }, 30000);
      } else {
        setGameResult({ outcome, reason });
        setScreen('result');
      }
    };

    const onOpponentDisconnected = () => {
      clearSession();
      showToast('Opponent disconnected.');
      setTimeout(() => { setScreen('home'); resetGame(); }, 2500);
    };

    const onOpponentReconnected = () => {
      showToast('Opponent reconnected.');
    };

    const onRematchCancelled = () => {
      showToast('Rematch cancelled.');
      setTimeout(() => { setScreen('home'); resetGame(); }, 2000);
    };

    socket.on('room_created', onRoomCreated);
    socket.on('join_error', onJoinError);
    socket.on('game_start', onGameStart);
    socket.on('game_rejoined', onGameRejoined);
    socket.on('rejoin_error', onRejoinError);
    socket.on('move_made', onMoveMade);
    socket.on('game_over', onGameOver);
    socket.on('opponent_disconnected', onOpponentDisconnected);
    socket.on('opponent_reconnected', onOpponentReconnected);
    socket.on('rematch_cancelled', onRematchCancelled);

    return () => {
      socket.off('room_created', onRoomCreated);
      socket.off('join_error', onJoinError);
      socket.off('game_start', onGameStart);
      socket.off('game_rejoined', onGameRejoined);
      socket.off('rejoin_error', onRejoinError);
      socket.off('move_made', onMoveMade);
      socket.off('game_over', onGameOver);
      socket.off('opponent_disconnected', onOpponentDisconnected);
      socket.off('opponent_reconnected', onOpponentReconnected);
      socket.off('rematch_cancelled', onRematchCancelled);
    };
  }, [playerColor]);

  function resetGame() {
    setFen(INITIAL_FEN);
    setTurn('w');
    setMyPoints(0);
    setOpponentPoints(0);
    setMyCaptured([]);
    setOpponentCaptured([]);
    setLastMove(null);
    setGameResult(null);
    setWaitingForRematch(false);
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  const handleResign = () => {
    clearSession();
    socket.emit('resign');
  };

  const handleCancelWaiting = () => {
    socket.emit('go_home');
    setIsWaitingForOpponent(false);
    setRoomCode('');
  };

  const handlePlayAgain = () => {
    setWaitingForRematch(true);
    socket.emit('play_again');
  };

  const handleGoHome = () => {
    clearSession();
    socket.emit('go_home');
    setScreen('home');
    resetGame();
    setRoomCode('');
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {screen === 'loading' && <LoadingScreen onEnter={handleEnterFromLoading} />}
      {screen === 'home' && (
        <HomeScreen
          socket={socket}
          theme={theme}
          onThemeChange={handleThemeChange}
          pieceStyle={pieceStyle}
          onPieceStyleChange={handlePieceStyleChange}
          isWaiting={isWaitingForOpponent}
          roomCode={roomCode}
          onCancelWaiting={handleCancelWaiting}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          socket={socket}
          fen={fen}
          playerColor={playerColor}
          playerName={playerName}
          opponentName={opponentName}
          myPoints={myPoints}
          opponentPoints={opponentPoints}
          myCaptured={myCaptured}
          opponentCaptured={opponentCaptured}
          turn={turn}
          lastMove={lastMove}
          onResign={handleResign}
          pieceStyle={pieceStyle}
        />
      )}
      {screen === 'result' && gameResult && (
        <ResultScreen
          outcome={gameResult.outcome}
          reason={gameResult.reason}
          onPlayAgain={handlePlayAgain}
          onHome={handleGoHome}
          waitingForRematch={waitingForRematch}
        />
      )}

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: '#121212', color: '#f5f5f5',
          fontFamily: 'Poppins, sans-serif', fontSize: 15,
          padding: '10px 24px', borderRadius: 6, zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
