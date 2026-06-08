// Servidor central do jogo "Corrida das Reliquias".
// Mantem todas as salas e seus estados, recebe acoes dos fronts (criar sala,
// entrar, rolar dado, reiniciar) e transmite o estado atualizado em tempo real
// para os dois jogadores via Socket.IO (WebSocket).

const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const { RaceGame } = require("./game");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// Rota simples so para conferir no navegador se o servidor esta no ar.
app.get("/", (_req, res) => {
  res.json({
    game: "Corrida das Reliquias",
    status: "online",
    rooms: rooms.size,
  });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Estado em memoria do servidor.
const rooms = new Map(); // roomCode -> RaceGame
const socketInfo = new Map(); // socket.id -> { roomCode, playerId }

// Gera um codigo de sala curto, legivel e unico (ex.: "K7Q2").
function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem chars ambiguos
  let code = "";
  do {
    code = "";
    for (let i = 0; i < 4; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  } while (rooms.has(code));
  return code;
}

// Envia o estado atual da sala para todos os sockets dela.
function broadcastState(roomCode) {
  const game = rooms.get(roomCode);
  if (game) {
    io.to(roomCode).emit("state", game.snapshot());
  }
}

io.on("connection", (socket) => {
  console.log(`[conexao] socket ${socket.id} conectado`);

  // ---- Criar sala ---------------------------------------------------------
  socket.on("createRoom", ({ name } = {}, callback) => {
    const roomCode = generateRoomCode();
    const game = new RaceGame(roomCode);
    rooms.set(roomCode, game);

    const player = game.addPlayer(name);
    socket.join(roomCode);
    socketInfo.set(socket.id, { roomCode, playerId: player.id });

    console.log(`[sala] ${roomCode} criada por ${player.name}`);
    if (typeof callback === "function") {
      callback({ ok: true, roomCode, playerId: player.id });
    }
    broadcastState(roomCode);
  });

  // ---- Entrar em sala existente ------------------------------------------
  socket.on("joinRoom", ({ name, roomCode } = {}, callback) => {
    const code = String(roomCode || "").toUpperCase().trim();
    const game = rooms.get(code);

    if (!game) {
      if (typeof callback === "function") {
        callback({ ok: false, reason: "Sala nao encontrada. Confira o codigo." });
      }
      return;
    }
    if (game.isFull) {
      if (typeof callback === "function") {
        callback({ ok: false, reason: "Esta sala ja esta cheia (2 jogadores)." });
      }
      return;
    }

    const player = game.addPlayer(name);
    socket.join(code);
    socketInfo.set(socket.id, { roomCode: code, playerId: player.id });

    console.log(`[sala] ${player.name} entrou na sala ${code}`);
    if (typeof callback === "function") {
      callback({ ok: true, roomCode: code, playerId: player.id });
    }
    broadcastState(code);
  });

  // ---- Rolar o dado (acao de jogo) ---------------------------------------
  socket.on("rollDice", (_payload, callback) => {
    const info = socketInfo.get(socket.id);
    if (!info) {
      return;
    }
    const game = rooms.get(info.roomCode);
    if (!game) {
      return;
    }

    // Toda a regra acontece no servidor; o front nao decide nada.
    const result = game.rollDice(info.playerId);
    if (typeof callback === "function") {
      callback(result);
    }

    if (result.ok) {
      // Evento extra usado pelos fronts para animar a peca andando.
      io.to(info.roomCode).emit("rolled", result);
      broadcastState(info.roomCode);
    }
  });

  // ---- Reiniciar partida --------------------------------------------------
  socket.on("resetGame", () => {
    const info = socketInfo.get(socket.id);
    if (!info) {
      return;
    }
    const game = rooms.get(info.roomCode);
    if (!game) {
      return;
    }
    game.reset();
    broadcastState(info.roomCode);
  });

  // ---- Desconexao ---------------------------------------------------------
  socket.on("disconnect", () => {
    const info = socketInfo.get(socket.id);
    socketInfo.delete(socket.id);
    if (!info) {
      return;
    }

    const game = rooms.get(info.roomCode);
    if (!game) {
      return;
    }

    const player = game.setConnection(info.playerId, false);
    if (player) {
      game.addLog(`${player.name} desconectou.`);
    }
    broadcastState(info.roomCode);

    // Se ninguem mais esta conectado, a sala e descartada para liberar memoria.
    if (game.players.every((p) => !p.connected)) {
      rooms.delete(info.roomCode);
      console.log(`[sala] ${info.roomCode} removida (vazia)`);
    }
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("==============================================");
  console.log("  Corrida das Reliquias - servidor central");
  console.log(`  Ouvindo na porta ${PORT} (0.0.0.0)`);
  console.log("  Acesse de outro PC via http://<IP-da-maquina>:" + PORT);
  console.log("==============================================");
});
