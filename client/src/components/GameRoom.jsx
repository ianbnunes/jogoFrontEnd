import { useState } from "react";
import Board from "./Board";
import Scoreboard from "./Scoreboard";
import RankingTable from "./RankingTable";
import MoveLog from "./MoveLog";
import WinnerModal from "./WinnerModal";

// Tela principal da partida. Tudo que ela mostra vem do snapshot do servidor;
// as unicas acoes que ela dispara sao "rolar dado" e "reiniciar". A decisao de
// quem pode jogar (de quem e a vez) tambem vem do backend.
export default function GameRoom({ connected, state, me, onRoll, onReset }) {
  const [copied, setCopied] = useState(false);

  const { players, track, finishIndex, currentPlayerId, lastDice, status, winnerId } = state;

  const currentPlayer = players.find((player) => player.id === currentPlayerId);
  const winner = players.find((player) => player.id === winnerId) || null;

  const isMyTurn = status === "playing" && currentPlayerId === me.playerId;
  const waitingForRival = status === "waiting";

  function turnText() {
    if (waitingForRival) return "Aguardando o segundo jogador entrar...";
    if (status === "finished" && winner) return `${winner.name} venceu!`;
    if (currentPlayer) {
      return isMyTurn ? `Sua vez, ${currentPlayer.name}!` : `Vez de ${currentPlayer.name}`;
    }
    return "Preparando a partida...";
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Partida em rede</p>
          <h1>Corrida das Reliquias</h1>
        </div>
        <div className="room-chip">
          <span className="room-chip-label">Codigo da sala</span>
          <button type="button" className="room-code-btn" onClick={copyCode} title="Copiar codigo">
            {state.roomCode}
            <span className="room-copy-hint">{copied ? "copiado!" : "copiar"}</span>
          </button>
        </div>
      </header>

      <section className="status-banner">
        <div>
          <p className="banner-label">Vez atual</p>
          <h2>{turnText()}</h2>
          <p className={`connection-pill ${connected ? "is-online" : "is-offline"}`}>
            <span className="connection-dot" />
            {connected ? "Conectado" : "Reconectando..."}
          </p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="primary-button"
            onClick={onRoll}
            disabled={!isMyTurn}
          >
            {isMyTurn ? "Rolar dado" : "Aguarde sua vez"}
          </button>
          <button type="button" className="ghost-button" onClick={onReset}>
            Reiniciar partida
          </button>
        </div>
      </section>

      {waitingForRival && (
        <section className="waiting-card">
          <p>
            Compartilhe o codigo <strong>{state.roomCode}</strong> com o outro jogador. A
            partida comeca automaticamente assim que ele entrar.
          </p>
        </section>
      )}

      <section className="dashboard-grid">
        <article className="board-panel">
          <div className="board-header">
            <div>
              <p className="panel-label">Tabuleiro</p>
              <h3>Trilha das 20 casas</h3>
            </div>
            <div className="dice-card">
              <span className="dice-label">Ultimo dado</span>
              <strong id="dice-value">{lastDice ?? "-"}</strong>
            </div>
          </div>

          <Board
            players={players}
            track={track}
            finishIndex={finishIndex}
            currentPlayerId={currentPlayerId}
          />

          <div className="legend">
            {players.map((player) => (
              <span key={player.id}>
                <i className={`token-dot ${player.colorClass}`} />
                {player.name}
              </span>
            ))}
            <span>
              <i className="finish-dot" />
              Chegada
            </span>
          </div>
        </article>

        <aside className="sidebar">
          <article className="score-panel">
            <div className="panel-heading">
              <p className="panel-label">Placar</p>
              <h3>Pontuacao dos aventureiros</h3>
            </div>
            <Scoreboard
              players={players}
              currentPlayerId={currentPlayerId}
              myPlayerId={me.playerId}
            />
          </article>

          <article className="table-panel">
            <div className="panel-heading">
              <p className="panel-label">Tabela dinamica</p>
              <h3>Ranking da rodada</h3>
            </div>
            <RankingTable players={players} />
          </article>

          <article className="log-panel">
            <div className="panel-heading">
              <p className="panel-label">Lista dinamica</p>
              <h3>Historico de jogadas</h3>
            </div>
            <MoveLog log={state.log} />
          </article>
        </aside>
      </section>

      {status === "finished" && <WinnerModal winner={winner} onPlayAgain={onReset} />}
    </main>
  );
}
