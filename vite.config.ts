import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    /* Absolute imports from src, read straight out of tsconfig — no extra plugin needed. */
    resolve: { tsconfigPaths: true },
    server: {
        port: 5173,
        // The backend allows http://localhost:5173 through CORS, but proxying keeps the browser on
        // one origin, so there is no preflight and no CORS surprise in development.
        proxy: {
            '/api': { target: 'http://localhost:8080', changeOrigin: true },
        },
    },
    preview: { port: 5173 },
})
