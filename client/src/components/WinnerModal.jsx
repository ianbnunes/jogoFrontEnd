// Modal exibido quando o servidor informa que a partida terminou (status
// "finished"). Mostra o vencedor e permite reiniciar a partida na mesma sala.
export default function WinnerModal({ winner, onPlayAgain }) {
  if (!winner) {
    return null;
  }

  return (
    <div className="winner-modal" role="dialog" aria-modal="true" aria-labelledby="winner-title">
      <div className="winner-card">
        <p className="eyebrow">Fim de jogo</p>
        <h2 id="winner-title">{winner.name} venceu a corrida!</h2>
        <p>
          Com {winner.score} pontos, {winner.name} alcancou a reliquia antes do
          adversario.
        </p>
        <button type="button" className="primary-button" onClick={onPlayAgain}>
          Jogar novamente
        </button>
      </div>
    </div>
  );
}
