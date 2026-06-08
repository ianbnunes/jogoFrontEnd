import { useState } from "react";

// Tela inicial: o jogador escolhe entre criar uma nova sala ou entrar numa
// sala existente usando um codigo. Substitui a tela index.html da unidade 1,
// agora preparada para multiplayer em maquinas diferentes.
export default function Lobby({ connected, error, onCreate, onJoin }) {
  const [mode, setMode] = useState("create"); // "create" | "join"
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [localMessage, setLocalMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setLocalMessage("Informe o seu nome para comecar.");
      return;
    }
    if (mode === "join" && !roomCode.trim()) {
      setLocalMessage("Informe o codigo da sala para entrar.");
      return;
    }

    setLocalMessage("");
    setBusy(true);
    if (mode === "create") {
      await onCreate(trimmedName);
    } else {
      await onJoin(trimmedName, roomCode.trim().toUpperCase());
    }
    setBusy(false);
  }

  const message = localMessage || error;

  return (
    <main className="landing-shell">
      <section className="hero-card">
        <p className="eyebrow">Multiplayer em rede - 2 jogadores</p>
        <h1>Corrida das Reliquias</h1>
        <p className="hero-copy">
          Dois aventureiros, cada um no seu computador, disputam uma trilha cheia de
          energia arcana. O servidor central controla as regras, o dado, a pontuacao e
          de quem e a vez. Crie uma sala e compartilhe o codigo com o seu rival.
        </p>

        <div className="feature-strip">
          <article>
            <span className="feature-number">01</span>
            <p>Servidor central decide tudo (dado, regras e placar).</p>
          </article>
          <article>
            <span className="feature-number">02</span>
            <p>Jogadores em maquinas diferentes na mesma rede.</p>
          </article>
          <article>
            <span className="feature-number">03</span>
            <p>Tabuleiro, ranking e historico sincronizados em tempo real.</p>
          </article>
        </div>

        <p className={`connection-pill ${connected ? "is-online" : "is-offline"}`}>
          <span className="connection-dot" />
          {connected ? "Conectado ao servidor" : "Procurando o servidor..."}
        </p>
      </section>

      <section className="setup-card">
        <h2>Entrar na partida</h2>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === "create" ? "mode-button active" : "mode-button"}
            onClick={() => setMode("create")}
          >
            Criar sala
          </button>
          <button
            type="button"
            className={mode === "join" ? "mode-button active" : "mode-button"}
            onClick={() => setMode("join")}
          >
            Entrar com codigo
          </button>
        </div>

        <p className="setup-copy">
          {mode === "create"
            ? "Crie uma sala e envie o codigo gerado para o segundo jogador."
            : "Digite o codigo que o primeiro jogador compartilhou com voce."}
        </p>

        <form className="setup-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="player-name">Seu nome</label>
          <input
            id="player-name"
            type="text"
            maxLength={20}
            placeholder="Ex.: Lara"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />

          {mode === "join" && (
            <>
              <label htmlFor="room-code">Codigo da sala</label>
              <input
                id="room-code"
                type="text"
                maxLength={4}
                placeholder="Ex.: K7Q2"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                autoComplete="off"
                className="room-code-input"
              />
            </>
          )}

          <p className="form-message" aria-live="polite">
            {message}
          </p>

          <button type="submit" className="primary-button" disabled={busy || !connected}>
            {busy
              ? "Aguarde..."
              : mode === "create"
              ? "Criar sala e aguardar rival"
              : "Entrar na sala"}
          </button>
        </form>
      </section>
    </main>
  );
}
