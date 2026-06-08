// Tabela dinamica com o ranking da rodada. A ordenacao reproduz a regra da
// unidade 1: posicao (desc), depois pontos (desc), depois menos jogadas.
export default function RankingTable({ players }) {
  const ranking = [...players].sort(
    (a, b) => b.position - a.position || b.score - a.score || a.turns - b.turns
  );

  return (
    <table className="ranking-table">
      <thead>
        <tr>
          <th>Posicao</th>
          <th>Jogador</th>
          <th>Casa</th>
          <th>Pontos</th>
        </tr>
      </thead>
      <tbody>
        {ranking.map((player, index) => (
          <tr key={player.id}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.position + 1}</td>
            <td>{player.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
