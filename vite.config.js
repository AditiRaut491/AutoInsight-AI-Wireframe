import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves a project site from https://<user>.github.io/<repository-name>/
// so production builds use the repository name as the base path.
// If you rename the repository, change REPO_BASE to match.
const REPO_BASE = '/AutoInsight-AI-Wireframe/';

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // `npm run dev` serves from / ; `npm run build` and `npm run preview` use the GitHub Pages path.
  base: command === 'build' || isPreview ? REPO_BASE : '/',
  build: {
    rollupOptions: {
      output: {
        // Separate long-lived library code from app code for faster repeat visits.
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], charts: ['recharts'] },
      },
    },
    chunkSizeWarningLimit: 700,
  },
}));
