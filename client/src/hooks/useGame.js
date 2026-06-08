import { useCallback, useEffect, useState } from "react";
import { socket } from "../socket";

// Hook central do front: cuida de toda a conversa com o servidor via Socket.IO.
// Ele NAO contem regras do jogo (essas vivem no backend). Apenas:
//  - guarda o ultimo estado recebido do servidor (snapshot);
//  - sabe quem "eu sou" nesta sala (roomCode + playerId);
//  - expoe acoes (criar sala, entrar, rolar dado, reiniciar).
export function useGame() {
  const [connected, setConnected] = useState(socket.connected);
  const [state, setState] = useState(null); // snapshot vindo do servidor
  const [me, setMe] = useState(null); // { roomCode, playerId }
  const [lastRoll, setLastRoll] = useState(null); // { from, to, dice, playerId }
  const [error, setError] = useState("");

  useEffect(() => {
    function handleConnect() {
      setConnected(true);
    }
    function handleDisconnect() {
      setConnected(false);
    }
    function handleState(snapshot) {
      setState(snapshot);
    }
    function handleRolled(result) {
      // Identidade nova a cada rolagem garante que a animacao reinicie.
      setLastRoll({ ...result, key: `${result.playerId}-${result.to}-${result.dice}` });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("state", handleState);
    socket.on("rolled", handleRolled);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("state", handleState);
      socket.off("rolled", handleRolled);
    };
  }, []);

  const createRoom = useCallback(
    (name) =>
      new Promise((resolve) => {
        setError("");
        socket.emit("createRoom", { name }, (res) => {
          if (res && res.ok) {
            setMe({ roomCode: res.roomCode, playerId: res.playerId });
          } else {
            setError((res && res.reason) || "Nao foi possivel criar a sala.");
          }
          resolve(res);
        });
      }),
    []
  );

  const joinRoom = useCallback(
    (name, roomCode) =>
      new Promise((resolve) => {
        setError("");
        socket.emit("joinRoom", { name, roomCode }, (res) => {
          if (res && res.ok) {
            setMe({ roomCode: res.roomCode, playerId: res.playerId });
          } else {
            setError((res && res.reason) || "Nao foi possivel entrar na sala.");
          }
          resolve(res);
        });
      }),
    []
  );

  const rollDice = useCallback(() => {
    setError("");
    socket.emit("rollDice", {}, (res) => {
      if (res && !res.ok) {
        setError(res.reason || "Jogada invalida.");
      }
    });
  }, []);

  const resetGame = useCallback(() => {
    setError("");
    socket.emit("resetGame");
  }, []);

  return {
    connected,
    state,
    me,
    lastRoll,
    error,
    createRoom,
    joinRoom,
    rollDice,
    resetGame,
  };
}
