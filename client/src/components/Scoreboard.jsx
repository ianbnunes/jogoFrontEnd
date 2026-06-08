// Placar dos jogadores. So exibe dados que vem do servidor (casa, pontos,
// jogadas) e destaca o jogador da vez.
export default function Scoreboard({ players, currentPlayerId, myPlayerId }) {
  return (
    <div className="scoreboard">
      {players.map((player) => {
        const classes = ["player-card"];
        if (player.id === currentPlayerId) classes.push("active");

        return (
          <article key={player.id} className={classes.join(" ")}>
            <div className="player-name-line">
              <strong>
                {player.name}
                {player.id === myPlayerId && <span className="you-tag"> (voce)</span>}
              </strong>
              <span className="player-badge">
                Peao {player.id}
                {!player.connected && " - offline"}
              </span>
            </div>
            <div className="player-stats">
              <span>Casa: {player.position + 1}</span>
              <span>Pontos: {player.score}</span>
              <span>Jogadas: {player.turns}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
