// Teste de integracao do servidor (nao faz parte do app). Simula dois jogadores
// em conexoes Socket.IO distintas e verifica regras, turnos e vitoria.
import { io } from "socket.io-client";

const URL = "http://localhost:3001";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function connect() {
  return io(URL, { transports: ["websocket"], forceNew: true });
}

function emitAck(sock, event, payload) {
  return new Promise((resolve) => sock.emit(event, payload, resolve));
}

const p1 = connect();
const p2 = connect();

let lastState = null;
p1.on("state", (s) => (lastState = s));

await wait(300);

// 1) Player 1 cria a sala
const created = await emitAck(p1, "createRoom", { name: "Lara" });
console.log("createRoom ->", created);
if (!created.ok) throw new Error("falha ao criar sala");

// 2) Player 2 entra
const joined = await emitAck(p2, "joinRoom", { name: "Ravi", roomCode: created.roomCode });
console.log("joinRoom  ->", joined);
if (!joined.ok) throw new Error("falha ao entrar na sala");
await wait(150);
console.log("status apos 2 jogadores:", lastState.status, "| vez do id:", lastState.currentPlayerId);

// 3) Player 2 tenta rolar fora da vez -> deve ser bloqueado pelo servidor
const wrongTurn = await emitAck(p2, "rollDice", {});
console.log("p2 rola fora da vez ->", wrongTurn);
if (wrongTurn.ok) throw new Error("ERRO: servidor deixou jogar fora da vez!");

// 4) Joga ate alguem vencer, sempre respeitando a vez informada pelo servidor
const sockById = { 1: p1, 2: p2 };
let rolls = 0;
while (lastState.status === "playing" && rolls < 200) {
  const turnSock = sockById[lastState.currentPlayerId];
  const res = await emitAck(turnSock, "rollDice", {});
  if (!res.ok) throw new Error("rolagem na vez correta foi recusada: " + res.reason);
  rolls += 1;
  await wait(30);
}

console.log(`\nPartida encerrada em ${rolls} rolagens.`);
console.log("status:", lastState.status, "| vencedor id:", lastState.winnerId);
console.log(
  "placar final:",
  lastState.players.map((p) => `${p.name}=casa${p.position + 1}/${p.score}pts/${p.turns}jogadas`).join("  ")
);
console.log("ultima entrada do log:", lastState.log[0]);

// 5) Reset
p1.emit("resetGame");
await wait(150);
console.log("\napos reset -> status:", lastState.status, "| dado:", lastState.lastDice,
  "| pos:", lastState.players.map((p) => p.position).join(","));

p1.close();
p2.close();
console.log("\nOK: todos os checks passaram.");
process.exit(0);
