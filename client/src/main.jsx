import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// O React assume o controle do elemento #root. Nenhuma outra parte do codigo
// manipula o DOM diretamente: toda a interface e descrita por componentes.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
