/// <reference types="vite/client" />

export const config = {
  http_server: `${import.meta.env.VITE_API_URL}/api`,
  ws_server: `${import.meta.env.VITE_EDITOR_URL}/ws`
};
