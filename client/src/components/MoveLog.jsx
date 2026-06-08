// Lista dinamica com o historico das jogadas. O servidor ja envia as entradas
// mais recentes primeiro, entao apenas renderizamos.
export default function MoveLog({ log }) {
  return (
    <ul className="move-log">
      {log.map((entry, index) => (
        <li key={`${index}-${entry}`}>{entry}</li>
      ))}
    </ul>
  );
}
