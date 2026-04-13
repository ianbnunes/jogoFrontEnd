class Player {
  constructor(id, name, colorClass) {
    this.id = id;
    this.name = name;
    this.colorClass = colorClass;
    this.position = 0;
    this.score = 0;
    this.turns = 0;
  }

  move(steps, finishIndex) {
    this.turns += 1;
    this.position = Math.min(this.position + steps, finishIndex);
    this.score = this.position * 5;
  }

  reset() {
    this.position = 0;
    this.score = 0;
    this.turns = 0;
  }
}

class Dice {
  roll() {
    return Math.floor(Math.random() * 6) + 1;
  }
}

class RaceGame {
  constructor() {
    this.boardElement = document.getElementById("board");
    this.turnIndicator = document.getElementById("turn-indicator");
    this.diceValue = document.getElementById("dice-value");
    this.scoreboard = document.getElementById("scoreboard");
    this.rankingBody = document.getElementById("ranking-body");
    this.moveLog = document.getElementById("move-log");
    this.rollButton = document.getElementById("roll-button");
    this.resetButton = document.getElementById("reset-button");
    this.winnerModal = document.getElementById("winner-modal");
    this.winnerTitle = document.getElementById("winner-title");
    this.winnerMessage = document.getElementById("winner-message");
    this.playAgainButton = document.getElementById("play-again-button");
    this.legendPlayer1 = document.getElementById("legend-player-1");
    this.legendPlayer2 = document.getElementById("legend-player-2");

    this.track = [
      "Base",
      "Ruinas",
      "Trilha",
      "Ponte",
      "Rio",
      "Tenda",
      "Totem",
      "Lago",
      "Pedreira",
      "Portal",
      "Bosque",
      "Duna",
      "Observatorio",
      "Templo",
      "Cristal",
      "Vale",
      "Arco",
      "Colina",
      "Camara",
      "Reliquia"
    ];

    this.players = this.createPlayersFromUrl();
    this.dice = new Dice();
    this.currentPlayerIndex = 0;
    this.isAnimating = false;
    this.maxLogEntries = 8;

    this.renderStaticBoard();
    this.renderAll();
    this.bindEvents();
    this.addLogEntry("A partida comecou. O primeiro aventureiro ja pode rolar o dado.");
  }

  createPlayersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const firstName = params.get("player1") || "Jogador 1";
    const secondName = params.get("player2") || "Jogador 2";

    this.legendPlayer1.textContent = firstName;
    this.legendPlayer2.textContent = secondName;

    return [
      new Player(1, firstName, "token-one"),
      new Player(2, secondName, "token-two")
    ];
  }

  bindEvents() {
    this.rollButton.addEventListener("click", () => this.handleRoll());
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.playAgainButton.addEventListener("click", () => this.resetGame());
  }

  renderStaticBoard() {
    this.boardElement.innerHTML = "";

    this.track.forEach((label, index) => {
      const cell = document.createElement("article");
      cell.className = "board-cell";
      cell.dataset.index = String(index);

      if (index === this.track.length - 1) {
        cell.classList.add("finish");
      }

      const number = document.createElement("span");
      number.className = "cell-number";
      number.textContent = `Casa ${index + 1}`;

      const title = document.createElement("strong");
      title.className = "cell-title";
      title.textContent = label;

      const tokenWrap = document.createElement("div");
      tokenWrap.className = "token-wrap";

      cell.append(number, title, tokenWrap);
      this.boardElement.appendChild(cell);
    });
  }

  renderAll() {
    this.updateTurnIndicator();
    this.renderBoardTokens();
    this.renderScoreboard();
    this.renderRankingTable();
  }

  updateTurnIndicator() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    this.turnIndicator.textContent = `Vez de ${currentPlayer.name}`;
  }

  renderBoardTokens() {
    const cells = [...this.boardElement.querySelectorAll(".board-cell")];

    cells.forEach((cell) => {
      cell.classList.remove("active-turn", "highlight");
      cell.querySelector(".token-wrap").innerHTML = "";
    });

    this.players.forEach((player, index) => {
      const cell = cells[player.position];
      const token = document.createElement("span");
      token.className = `token ${player.colorClass} show`;
      token.title = player.name;
      cell.querySelector(".token-wrap").appendChild(token);

      if (index === this.currentPlayerIndex) {
        cell.classList.add("active-turn");
      }
    });
  }

  renderScoreboard() {
    this.scoreboard.innerHTML = "";

    this.players.forEach((player, index) => {
      const card = document.createElement("article");
      card.className = "player-card";

      if (index === this.currentPlayerIndex) {
        card.classList.add("active");
      }

      const nameLine = document.createElement("div");
      nameLine.className = "player-name-line";
      const nameStrong = document.createElement("strong");
      nameStrong.textContent = player.name;
      const badge = document.createElement("span");
      badge.className = "player-badge";
      badge.textContent = `Peao ${player.id}`;
      nameLine.append(nameStrong, badge);

      const stats = document.createElement("div");
      stats.className = "player-stats";
      const house = document.createElement("span");
      house.textContent = `Casa: ${player.position + 1}`;
      const points = document.createElement("span");
      points.textContent = `Pontos: ${player.score}`;
      const turns = document.createElement("span");
      turns.textContent = `Jogadas: ${player.turns}`;
      stats.append(house, points, turns);

      card.append(nameLine, stats);
      this.scoreboard.appendChild(card);
    });
  }

  renderRankingTable() {
    this.rankingBody.innerHTML = "";

    const ranking = [...this.players]
      .sort((a, b) => b.position - a.position || b.score - a.score || a.turns - b.turns);

    ranking.forEach((player, index) => {
      const row = document.createElement("tr");
      [index + 1, player.name, player.position + 1, player.score].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.appendChild(cell);
      });
      this.rankingBody.appendChild(row);
    });
  }

  addLogEntry(message) {
    const item = document.createElement("li");
    item.textContent = message;
    this.moveLog.insertBefore(item, this.moveLog.firstChild);

    while (this.moveLog.children.length > this.maxLogEntries) {
      this.moveLog.removeChild(this.moveLog.lastChild);
    }
  }

  async handleRoll() {
    if (this.isAnimating) {
      return;
    }

    const currentPlayer = this.players[this.currentPlayerIndex];
    const diceResult = this.dice.roll();
    const finishIndex = this.track.length - 1;
    const startPosition = currentPlayer.position;
    const finalPosition = Math.min(startPosition + diceResult, finishIndex);

    this.diceValue.textContent = String(diceResult);
    this.rollButton.disabled = true;
    this.isAnimating = true;

    await this.animateMovement(currentPlayer, startPosition, finalPosition);

    currentPlayer.move(diceResult, finishIndex);
    this.renderAll();

    const gained = finalPosition - startPosition;
    this.addLogEntry(
      `${currentPlayer.name} tirou ${diceResult}, avancou ${gained} casa(s) e chegou em ${this.track[currentPlayer.position]}.`
    );

    if (currentPlayer.position >= finishIndex) {
      this.finishGame(currentPlayer);
      return;
    }

    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
    this.updateTurnIndicator();
    this.renderScoreboard();
    this.renderBoardTokens();
    this.rollButton.disabled = false;
    this.isAnimating = false;
  }

  async animateMovement(player, startPosition, finalPosition) {
    const cells = [...this.boardElement.querySelectorAll(".board-cell")];

    for (let step = startPosition + 1; step <= finalPosition; step += 1) {
      player.position = step;
      cells.forEach((cell) => cell.classList.remove("highlight"));
      cells[step].classList.add("highlight");
      this.renderBoardTokens();
      this.renderScoreboard();
      await this.wait(260);
    }

    player.position = startPosition;
    cells.forEach((cell) => cell.classList.remove("highlight"));
  }

  finishGame(winner) {
    this.winnerTitle.textContent = `${winner.name} venceu a corrida!`;
    this.winnerMessage.textContent = `Com ${winner.score} pontos, ${winner.name} alcancou a reliquia antes do adversario.`;
    this.winnerModal.classList.remove("hidden");
    this.rollButton.disabled = true;
    this.isAnimating = false;
    this.addLogEntry(`Fim de jogo: ${winner.name} conquistou a reliquia e venceu a partida.`);
  }

  resetGame() {
    this.players.forEach((player) => player.reset());
    this.currentPlayerIndex = 0;
    this.isAnimating = false;
    this.diceValue.textContent = "-";
    this.moveLog.innerHTML = "";
    this.winnerModal.classList.add("hidden");
    this.rollButton.disabled = false;
    this.renderAll();
    this.addLogEntry("Nova partida iniciada. As pecas voltaram para a base.");
  }

  wait(duration) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });
  }
}

new RaceGame();
