// Configuracoes e dados estaticos do jogo "Corrida das Reliquias".
// Tudo que define as regras vive no backend (cerebro central da partida).

// Trilha de 20 casas. A ultima casa (indice 19) e a chegada ("Reliquia").
const TRACK = [
  "Base",
  "Ruinas",
  "Trilha",
  "Ponte",
  "Rio",
  "Tenda",
  "Totem",
  "Lago",
  "Pedreira",
  "Portal",
  "Bosque",
  "Duna",
  "Observatorio",
  "Templo",
  "Cristal",
  "Vale",
  "Arco",
  "Colina",
  "Camara",
  "Reliquia",
];

const FINISH_INDEX = TRACK.length - 1; // 19
const POINTS_PER_HOUSE = 5; // pontuacao = casa * 5 (mesma regra da unidade 1)
const MAX_LOG_ENTRIES = 8; // historico mantem as 8 jogadas mais recentes
const MAX_PLAYERS = 2; // partida para dois aventureiros
const DICE_SIDES = 6;

module.exports = {
  TRACK,
  FINISH_INDEX,
  POINTS_PER_HOUSE,
  MAX_LOG_ENTRIES,
  MAX_PLAYERS,
  DICE_SIDES,
};
