import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Chess } from 'chess.js';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// This server only handles Socket.IO connections; the frontend is hosted
// separately. A plain health-check response for anything else.
app.get('/', (_req, res) => res.send('Chess server is running.'));

// ── Room code generator ───────────────────────────────────────────────────────
const ADJECTIVES = ['amber','bold','brave','calm','dark','dusty','elder','fast','gold','grand','green','happy','iron','jade','kind','lemon','light','lucky','magic','noble','old','pine','quick','red','royal','sage','sharp','silent','silver','slim','solar','spicy','stone','storm','sweet','tall','tiny','violet','warm','wild','winter','wooden','young','zippy','azure','brass','bronze','chrome','cobalt','coral'];
const NOUNS = ['arrow','badge','banner','bell','bird','blade','board','book','branch','bridge','brook','canyon','castle','cave','clock','cloud','coin','crown','dawn','door','dragon','drum','eagle','field','flame','flower','forge','fox','gem','glacier','harbor','hawk','hill','horn','island','jade','key','lake','lamp','leaf','lens','lion','map','mist','moon','mountain','oak','petal','pine','river','rock','rose','sail','seed','shield','ship','shore','star','stone','storm','sword','tiger','tower','trail','vale','valley','vine','wave','wolf','wood'];

function generateCode(rooms) {
  let code;
  do {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = String(Math.floor(Math.random() * 90) + 10);
    code = `${adj}-${noun}-${num}`;
  } while (rooms.has(code));
  return code;
}

// ── Piece point values ────────────────────────────────────────────────────────
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// How long (ms) to wait for a disconnected player to reconnect before ending
// the game. Matches the client's session TTL: a tab going inactive/backgrounded
// for a few minutes (common — browsers throttle background tabs, which can
// silently drop the socket) should never end the game on its own. Only an
// explicit resign, checkmate/stalemate/draw, or this window actually elapsing
// should end it.
const RECONNECT_WINDOW_MS = 60 * 60 * 1000;

// ── Rooms map ─────────────────────────────────────────────────────────────────
const rooms = new Map();

function getRoomBySocketId(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.socketId === socketId)) return room;
  }
  return null;
}

function broadcastGameStart(room, io) {
  room.whitePoints = 0;
  room.blackPoints = 0;
  room.whiteCaptured = [];
  room.blackCaptured = [];
  room.lastMove = null;
  room.startedAt = Date.now();
  room.chess = new Chess();
  room.status = 'playing';
  room.playAgainVotes = new Set();

  for (const p of room.players) {
    const opponent = room.players.find(x => x.socketId !== p.socketId);
    io.to(p.socketId).emit('game_start', {
      roomCode: room.code,
      playerColor: p.color,
      playerName: p.name,
      opponentName: opponent.name,
      fen: room.chess.fen(),
      turn: 'w',
      whitePoints: 0,
      blackPoints: 0,
      whiteCaptured: [],
      blackCaptured: [],
    });
  }
}

// ── Socket.IO ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  socket.on('create_room', ({ name }) => {
    const code = generateCode(rooms);
    const room = {
      code,
      players: [{ socketId: socket.id, name: name || 'Player 1', color: 'white' }],
      chess: null,
      whitePoints: 0,
      blackPoints: 0,
      whiteCaptured: [],
      blackCaptured: [],
      lastMove: null,
      startedAt: null,
      playAgainVotes: new Set(),
      status: 'waiting',
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room_created', { code });
  });

  socket.on('join_room', ({ name, code }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit('join_error', { message: 'Room not found.' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('join_error', { message: 'Room is full.' });
      return;
    }
    room.players.push({ socketId: socket.id, name: name || 'Player 2', color: 'black' });
    socket.join(code);
    broadcastGameStart(room, io);
  });

  socket.on('rejoin_room', ({ code, color }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') {
      socket.emit('rejoin_error', { message: 'Game no longer available.' });
      return;
    }

    const player = room.players.find(p => p.color === color);
    if (!player) {
      socket.emit('rejoin_error', { message: 'Player slot not found.' });
      return;
    }

    // Was this player actually away (pending disconnect timer, or a
    // different underlying socket), or is this just a redundant
    // re-announce from the client? Only the former is worth telling the
    // opponent about.
    const wasAway = !!player.reconnectTimer || player.socketId !== socket.id;

    // Cancel the reconnect timeout if it's running
    if (player.reconnectTimer) {
      clearTimeout(player.reconnectTimer);
      player.reconnectTimer = null;
    }

    // Swap in the new socket
    player.socketId = socket.id;
    socket.join(room.code);

    const opponent = room.players.find(p => p.color !== color);

    // Send full current game state
    socket.emit('game_rejoined', {
      roomCode: room.code,
      playerColor: player.color,
      playerName: player.name,
      opponentName: opponent ? opponent.name : '',
      fen: room.chess.fen(),
      turn: room.chess.turn(),
      whitePoints: room.whitePoints,
      blackPoints: room.blackPoints,
      whiteCaptured: room.whiteCaptured,
      blackCaptured: room.blackCaptured,
      lastMove: room.lastMove,
      startedAt: room.startedAt,
    });

    // Tell the opponent their partner is back, but only if they were
    // actually away — otherwise this fires on every harmless re-sync.
    if (wasAway && opponent && opponent.socketId) {
      io.to(opponent.socketId).emit('opponent_reconnected');
    }
  });

  socket.on('make_move', ({ from, to, promotion }) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const chess = room.chess;
    const colorChar = player.color === 'white' ? 'w' : 'b';
    if (chess.turn() !== colorChar) {
      socket.emit('move_rejected', { reason: 'Not your turn.' });
      return;
    }

    let moveResult;
    try {
      moveResult = chess.move({ from, to, promotion: promotion || 'q' });
    } catch {
      socket.emit('move_rejected', { reason: 'Illegal move.' });
      return;
    }

    if (!moveResult) {
      socket.emit('move_rejected', { reason: 'Illegal move.' });
      return;
    }

    // Track points and captured pieces
    if (moveResult.captured) {
      const pts = PIECE_VALUES[moveResult.captured] || 0;
      if (colorChar === 'w') {
        room.whitePoints += pts;
        room.whiteCaptured.push('b' + moveResult.captured);
      } else {
        room.blackPoints += pts;
        room.blackCaptured.push('w' + moveResult.captured);
      }
    }

    room.lastMove = { from: moveResult.from, to: moveResult.to };

    const payload = {
      fen: chess.fen(),
      turn: chess.turn(),
      lastMove: room.lastMove,
      whitePoints: room.whitePoints,
      blackPoints: room.blackPoints,
      whiteCaptured: room.whiteCaptured,
      blackCaptured: room.blackCaptured,
    };

    // Check for game over
    if (chess.isGameOver()) {
      room.status = 'ended';
      let reason = 'unknown';
      if (chess.isCheckmate()) reason = 'checkmate';
      else if (chess.isStalemate()) reason = 'stalemate';
      else if (chess.isDraw()) reason = 'draw';

      io.to(room.code).emit('move_made', payload);

      for (const p of room.players) {
        let outcome;
        if (reason === 'checkmate') {
          outcome = chess.turn() === (p.color === 'white' ? 'w' : 'b') ? 'lose' : 'win';
        } else {
          outcome = 'draw';
        }
        if (p.socketId) io.to(p.socketId).emit('game_over', { outcome, reason });
      }
    } else {
      io.to(room.code).emit('move_made', payload);
    }
  });

  socket.on('play_again', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.status !== 'ended') return;
    room.playAgainVotes.add(socket.id);

    if (room.playAgainVotes.size === 2) {
      for (const p of room.players) {
        p.color = p.color === 'white' ? 'black' : 'white';
      }
      broadcastGameStart(room, io);
    }
  });

  socket.on('resign', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room || room.status !== 'playing') return;
    room.status = 'ended';
    const opponent = room.players.find(p => p.socketId !== socket.id);
    socket.emit('game_over', { outcome: 'lose', reason: 'resignation' });
    if (opponent && opponent.socketId) io.to(opponent.socketId).emit('game_over', { outcome: 'win', reason: 'resignation' });
  });

  socket.on('go_home', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;
    const opponent = room.players.find(p => p.socketId !== socket.id);
    if (opponent && opponent.socketId) {
      io.to(opponent.socketId).emit('rematch_cancelled');
    }
    rooms.delete(room.code);
  });

  socket.on('disconnect', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    if (room.status === 'playing') {
      // Don't delete yet — give the player a window to reconnect
      player.socketId = null;
      player.reconnectTimer = setTimeout(() => {
        // Window expired: notify opponent and tear down room
        const opponent = room.players.find(p => p.socketId !== null);
        if (opponent && opponent.socketId) {
          io.to(opponent.socketId).emit('opponent_disconnected');
        }
        rooms.delete(room.code);
      }, RECONNECT_WINDOW_MS);
    } else if (room.status === 'ended') {
      const opponent = room.players.find(p => p.socketId !== socket.id);
      if (opponent && opponent.socketId) {
        io.to(opponent.socketId).emit('rematch_cancelled');
      }
      rooms.delete(room.code);
    } else {
      // 'waiting' — host left before anyone joined
      rooms.delete(room.code);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Chess server running on port ${PORT}`));
