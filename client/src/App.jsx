import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import HomeScreen from './screens/HomeScreen.jsx';
import WaitingScreen from './screens/WaitingScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultScreen from './screens/ResultScreen.jsx';
import { applyTheme } from './lib/themes.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL, { autoConnect: false });

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

function loadPieceStyle() {
  try {
    return localStorage.getItem('chess_piece_style') || 'geometric';
  } catch {
    return 'geometric';
  }
}

export default function App() {
  const [theme, setTheme] = useState('watermelon');
  const [pieceStyle, setPieceStyle] = useState(loadPieceStyle);
  const [screen, setScreen] = useState('home');

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
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => { applyTheme(theme); }, [theme]);

  function handlePieceStyleChange(style) {
    setPieceStyle(style);
    try { localStorage.setItem('chess_piece_style', style); } catch {}
  }

  // Connect + attempt rejoin from localStorage on startup
  useEffect(() => {
    socket.connect();

    const session = loadSession();
    if (session) {
      const tryRejoin = () => {
        socket.emit('rejoin_room', { code: session.roomCode, color: session.playerColor });
      };
      if (socket.connected) {
        tryRejoin();
      } else {
        socket.once('connect', tryRejoin);
      }
    }

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const onRoomCreated = ({ code }) => {
      setRoomCode(code);
      setScreen('waiting');
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
      setGameResult({ outcome, reason });
      setScreen('result');
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
    setScreen('home');
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
      {screen === 'home' && (
        <HomeScreen
          socket={socket}
          theme={theme}
          onThemeChange={t => setTheme(t)}
          pieceStyle={pieceStyle}
          onPieceStyleChange={handlePieceStyleChange}
        />
      )}
      {screen === 'waiting' && (
        <WaitingScreen roomCode={roomCode} onCancel={handleCancelWaiting} />
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
