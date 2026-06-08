# Corrida das Reliquias - Unidade 2 (React + Multiplayer em rede)

Jogo de corrida em tabuleiro para **2 jogadores em computadores diferentes**.
Esta e a evolucao do trabalho da 1a unidade: a logica saiu do front (que usava
manipulacao direta de DOM) e foi **centralizada num servidor**. Agora o front e
feito em **React** (renderizacao declarativa, sem `document.*` para a UI do jogo)
e os dois jogadores interagem em tempo real atraves do servidor via **Socket.IO**.

## O que mudou da Unidade 1 para a Unidade 2

| Aspecto | Unidade 1 | Unidade 2 |
| --- | --- | --- |
| Interface | HTML + JS manipulando o DOM (`getElementById`, `createElement`) | **React** (componentes declarativos) |
| Jogadores | 2 pessoas alternando na **mesma maquina** | 2 pessoas em **maquinas diferentes** (LAN) |
| Regras / dado / pontuacao / "passar a vez" | no front (navegador) | **no backend** (servidor central) |
| Comunicacao | nenhuma | **Socket.IO** (WebSocket) em tempo real |

As regras do jogo continuam as mesmas: trilha de 20 casas, dado de 1 a 6, a peca
anda o valor do dado, pontuacao = `casa x 5`, e quem chega primeiro na "Reliquia"
(casa 20) vence.

> A versao original da 1a unidade foi preservada na pasta [`legado-unidade1/`](legado-unidade1/).

## Estrutura do projeto

```
jogoFrontEnd-main/
├── server/                 # Backend - o "cerebro" do jogo
│   └── src/
│       ├── index.js        # Servidor Socket.IO: salas, conexoes, eventos
│       ├── game.js         # Regras: Player, RaceGame (dado, turnos, vitoria)
│       └── constants.js    # Trilha de 20 casas e configuracoes
├── client/                 # Frontend - React (Vite), sem manipular o DOM
│   └── src/
│       ├── main.jsx        # Monta o React no #root
│       ├── App.jsx         # Alterna entre Lobby e Sala de jogo
│       ├── socket.js       # Conexao com o servidor (descobre o IP via LAN)
│       ├── hooks/useGame.js# Recebe o estado do servidor e envia acoes
│       └── components/      # Lobby, GameRoom, Board, Scoreboard, Ranking, ...
└── legado-unidade1/        # Versao original (1a unidade), apenas para referencia
```

## Pre-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (testado no Node 24).

## Como rodar (passo a passo)

Voce vai abrir **dois terminais** na maquina que sera o "anfitriao" (a que roda o
servidor). O outro jogador acessa pelo navegador, pelo IP dessa maquina.

### 1. Instalar dependencias (so na primeira vez)

```powershell
cd server
npm install
cd ../client
npm install
```

### 2. Iniciar o servidor (Terminal 1)

```powershell
cd server
npm start
```

Deve aparecer `Ouvindo na porta 3001 (0.0.0.0)`.

### 3. Iniciar o front-end (Terminal 2)

```powershell
cd client
npm run dev
```

O Vite mostra dois enderecos, por exemplo:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.0.10:5173/   <-- use este nos dois PCs
```

### 4. Jogar em dois computadores

1. **Descubra o IP** da maquina anfitria. No Windows: `ipconfig` -> "Endereco IPv4"
   (ex.: `192.168.0.10`). E o mesmo IP que aparece em **Network** acima.
2. **PC 1** (anfitriao) abre `http://192.168.0.10:5173`, digita o nome e clica
   em **Criar sala**. Um codigo de 4 letras aparece (ex.: `K7Q2`).
3. **PC 2** (na mesma rede Wi-Fi/cabo) abre `http://192.168.0.10:5173`, escolhe
   **Entrar com codigo**, digita o nome e o codigo da sala.
4. Assim que o segundo jogador entra, a partida comeca. O botao **Rolar dado**
   so fica ativo para quem estiver na vez. Tudo e decidido pelo servidor e
   sincronizado automaticamente nos dois navegadores.

> O front descobre o servidor sozinho: ele conecta no **mesmo IP** pelo qual a
> pagina foi aberta, na porta `3001`. Por isso os dois PCs devem abrir o jogo
> pelo endereco de **rede** (o IP), e nao por `localhost`.

### Testar sozinho (sem segundo PC)

Abra `http://localhost:5173` em **duas janelas** do navegador (ou uma normal e
uma anonima). Crie a sala numa e entre com o codigo na outra.

## Firewall (Windows)

Na primeira execucao o Windows pode perguntar se o **Node.js** pode aceitar
conexoes. Marque **Redes privadas** e permita. Sem isso, o outro PC nao consegue
se conectar.

## Configuracao opcional do servidor

Por padrao o front usa `http://<IP-da-pagina>:3001`. Para apontar para um
servidor especifico, crie `client/.env` com:

```
VITE_SERVER_URL=http://192.168.0.10:3001
```

(veja `client/.env.example`).

## Teste automatizado do backend (opcional)

Com o servidor rodando, e possivel validar as regras simulando dois jogadores
em conexoes separadas:

```powershell
cd client
node test-flow.mjs
```

Ele cria sala, faz o segundo jogador entrar, tenta jogar fora da vez (deve ser
bloqueado pelo servidor), joga ate o fim e reinicia.
