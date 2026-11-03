import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { layoutEditorPlugin } from './scripts/layout-editor-plugin';

export default defineConfig({
  plugins: [react(), layoutEditorPlugin()],
  build: { target: 'es2020' },
});
