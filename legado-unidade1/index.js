class StartScreen {
  constructor() {
    this.form = document.getElementById("start-form");
    this.player1Input = document.getElementById("player1");
    this.player2Input = document.getElementById("player2");
    this.message = document.getElementById("form-message");

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const player1 = this.player1Input.value.trim();
      const player2 = this.player2Input.value.trim();

      if (!player1 || !player2) {
        this.message.textContent = "Preencha os nomes dos dois jogadores para comecar.";
        return;
      }

      if (player1.toLowerCase() === player2.toLowerCase()) {
        this.message.textContent = "Use nomes diferentes para identificar cada jogador.";
        return;
      }

      const params = new URLSearchParams({
        player1,
        player2
      });

      window.location.href = `game.html?${params.toString()}`;
    });
  }
}

new StartScreen();
