// Logica central da partida. Esta classe e a "inteligencia" do jogo que, na
// unidade 1, ficava no front (game.js com manipulacao de DOM). Agora ela vive
// 100% no backend: regras, rolagem do dado, pontuacao, deteccao de vencedor e
// o controle de "passar a vez". Os fronts apenas enviam acoes e recebem estado.

const {
  TRACK,
  FINISH_INDEX,
  POINTS_PER_HOUSE,
  MAX_LOG_ENTRIES,
  MAX_PLAYERS,
  DICE_SIDES,
} = require("./constants");

class Player {
  constructor(id, name, colorClass) {
    this.id = id;
    this.name = name;
    this.colorClass = colorClass;
    this.position = 0;
    this.score = 0;
    this.turns = 0;
    this.connected = true;
  }

  // Move a peca somando os passos do dado, sem ultrapassar a chegada.
  move(steps) {
    this.turns += 1;
    this.position = Math.min(this.position + steps, FINISH_INDEX);
    this.score = this.position * POINTS_PER_HOUSE;
  }

  reset() {
    this.position = 0;
    this.score = 0;
    this.turns = 0;
  }

  // Versao "publica" enviada aos fronts.
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      colorClass: this.colorClass,
      position: this.position,
      score: this.score,
      turns: this.turns,
      connected: this.connected,
    };
  }
}

class RaceGame {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = []; // ate MAX_PLAYERS
    this.currentPlayerIndex = 0;
    this.lastDice = null;
    this.log = [];
    this.winnerId = null;
    // status: "waiting" (faltam jogadores) | "playing" | "finished"
    this.status = "waiting";
  }

  get isFull() {
    return this.players.length >= MAX_PLAYERS;
  }

  // Adiciona um jogador a sala. Retorna o Player criado ou null se cheia.
  addPlayer(name) {
    if (this.isFull) {
      return null;
    }

    const id = this.players.length + 1;
    const colorClass = id === 1 ? "token-one" : "token-two";
    const safeName = (name || `Jogador ${id}`).trim().slice(0, 20) || `Jogador ${id}`;
    const player = new Player(id, safeName, colorClass);
    this.players.push(player);

    if (this.isFull) {
      this.status = "playing";
      this.currentPlayerIndex = 0;
      this.addLog(
        `Os dois aventureiros estao prontos. ${this.players[0].name} comeca rolando o dado.`
      );
    } else {
      this.addLog(`Sala criada por ${player.name}. Aguardando o segundo jogador...`);
    }

    return player;
  }

  findPlayer(playerId) {
    return this.players.find((player) => player.id === playerId) || null;
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex] || null;
  }

  // Regra central de rolagem. Valida se e a vez do jogador, sorteia o dado,
  // move a peca, atualiza placar, detecta vitoria e passa a vez.
  rollDice(playerId) {
    if (this.status !== "playing") {
      return { ok: false, reason: "A partida nao esta em andamento." };
    }

    const current = this.currentPlayer;
    if (!current || current.id !== playerId) {
      return { ok: false, reason: "Aguarde: nao e a sua vez de jogar." };
    }

    const dice = Math.floor(Math.random() * DICE_SIDES) + 1;
    const from = current.position;
    current.move(dice);
    const to = current.position;
    const gained = to - from;
    this.lastDice = dice;

    this.addLog(
      `${current.name} tirou ${dice}, avancou ${gained} casa(s) e chegou em ${TRACK[to]}.`
    );

    if (to >= FINISH_INDEX) {
      this.status = "finished";
      this.winnerId = current.id;
      this.addLog(`Fim de jogo: ${current.name} conquistou a reliquia e venceu a partida.`);
    } else {
      this.passTurn();
    }

    return { ok: true, dice, from, to, playerId: current.id };
  }

  // "Passar a vez" alterna entre os dois jogadores.
  passTurn() {
    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
  }

  // Reinicia a partida mantendo os mesmos jogadores na sala.
  reset() {
    this.players.forEach((player) => player.reset());
    this.currentPlayerIndex = 0;
    this.lastDice = null;
    this.winnerId = null;
    this.log = [];

    if (this.isFull) {
      this.status = "playing";
      this.addLog("Nova partida iniciada. As pecas voltaram para a base.");
    } else {
      this.status = "waiting";
      this.addLog("Aguardando jogadores para reiniciar a partida.");
    }
  }

  setConnection(playerId, connected) {
    const player = this.findPlayer(playerId);
    if (player) {
      player.connected = connected;
    }
    return player;
  }

  addLog(message) {
    this.log.unshift(message);
    if (this.log.length > MAX_LOG_ENTRIES) {
      this.log.length = MAX_LOG_ENTRIES;
    }
  }

  // Snapshot completo do estado enviado aos fronts a cada mudanca.
  snapshot() {
    return {
      roomCode: this.roomCode,
      status: this.status,
      track: TRACK,
      finishIndex: FINISH_INDEX,
      currentPlayerId: this.currentPlayer ? this.currentPlayer.id : null,
      lastDice: this.lastDice,
      winnerId: this.winnerId,
      players: this.players.map((player) => player.toPublic()),
      log: this.log,
    };
  }
}

module.exports = { Player, RaceGame };
