import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PORT = "8080";
const SERVER_URL = "http://localhost";
const BASE_URL = "/";
// Do not inline or change this variable as it can be changed by Amplicode Studio code generation.
const AMPLICODE_ENDPOINTS = "graphql|login|logout";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      [`^/(${AMPLICODE_ENDPOINTS})`]: `${SERVER_URL}:${PORT}`
    },
    base: `${BASE_URL}`
  }
})
