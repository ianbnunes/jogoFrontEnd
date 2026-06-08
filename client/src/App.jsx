import { useGame } from "./hooks/useGame";
import Lobby from "./components/Lobby";
import GameRoom from "./components/GameRoom";

export default function App() {
  const game = useGame();

  // Enquanto nao entramos numa sala (ou ainda nao recebemos o estado dela),
  // mostramos o lobby. Depois, a sala de jogo.
  const inRoom = game.me && game.state && game.state.roomCode === game.me.roomCode;

  if (!inRoom) {
    return (
      <Lobby
        connected={game.connected}
        error={game.error}
        onCreate={game.createRoom}
        onJoin={game.joinRoom}
      />
    );
  }

  return (
    <GameRoom
      connected={game.connected}
      state={game.state}
      me={game.me}
      lastRoll={game.lastRoll}
      error={game.error}
      onRoll={game.rollDice}
      onReset={game.resetGame}
    />
  );
}
