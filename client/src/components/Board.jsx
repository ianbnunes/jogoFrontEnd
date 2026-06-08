import { useEffect, useRef, useState } from "react";

// Anima as pecas "andando" casa a casa. O servidor manda a posicao final; aqui
// apenas interpolamos visualmente do ponto atual ate o destino, tudo via estado
// do React (sem tocar no DOM). Em reinicios (destino menor) a peca volta na hora.
function useAnimatedPositions(players) {
  const [displayed, setDisplayed] = useState({});
  const targetsRef = useRef({});

  useEffect(() => {
    if (!players) {
      return undefined;
    }

    const targets = {};
    players.forEach((player) => {
      targets[player.id] = player.position;
    });
    targetsRef.current = targets;

    const timer = setInterval(() => {
      setDisplayed((prev) => {
        let changed = false;
        const next = { ...prev };
        players.forEach((player) => {
          const target = targetsRef.current[player.id] ?? 0;
          const current = next[player.id] ?? 0;
          if (current < target) {
            next[player.id] = current + 1; // avanca uma casa por tick
            changed = true;
          } else if (current > target) {
            next[player.id] = target; // reset: volta direto para a base
            changed = true;
          }
        });
        if (!changed) {
          clearInterval(timer);
        }
        return next;
      });
    }, 220);

    return () => clearInterval(timer);
  }, [players]);

  return displayed;
}

export default function Board({ players, track, finishIndex, currentPlayerId }) {
  const displayed = useAnimatedPositions(players);

  // Casa "em foco" = casa onde esta a peca de quem joga agora.
  const currentPlayer = players.find((player) => player.id === currentPlayerId);
  const highlightIndex = currentPlayer ? displayed[currentPlayer.id] ?? 0 : -1;

  return (
    <div className="board" aria-label="Tabuleiro da corrida">
      {track.map((label, index) => {
        const tokens = players.filter((player) => (displayed[player.id] ?? 0) === index);
        const classes = ["board-cell"];
        if (index === finishIndex) classes.push("finish");
        if (index === highlightIndex) classes.push("active-turn");

        return (
          <article key={index} className={classes.join(" ")}>
            <span className="cell-number">Casa {index + 1}</span>
            <strong className="cell-title">{label}</strong>
            <div className="token-wrap">
              {tokens.map((player) => (
                <span
                  key={player.id}
                  className={`token ${player.colorClass} show`}
                  title={player.name}
                />
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
