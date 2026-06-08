import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// host: true expoe o servidor de desenvolvimento na rede local (LAN),
// permitindo que o outro PC acesse pelo IP da maquina (ex.: http://192.168.0.10:5173).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
