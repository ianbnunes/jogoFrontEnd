import { io } from "socket.io-client";

// Descobre o endereco do servidor central.
// - Em LAN: a pagina e aberta pelo IP da maquina que hospeda o servidor
//   (ex.: http://192.168.0.10:5173), entao usamos o mesmo hostname na porta 3001.
// - Pode ser sobrescrito por VITE_SERVER_URL no arquivo .env do client.
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export { SERVER_URL };
