
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);

// Polyfill para crypto.randomUUID em browsers que bloqueiam a API em contexto HTTP (ex.: producao em HTTP)
if (typeof window !== "undefined") {
  if (!window.crypto) {
    window.crypto = {} as Crypto;
  }
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = () => {
      return (
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })
      ) as `${string}-${string}-${string}-${string}-${string}`;
    };
  }
}
  