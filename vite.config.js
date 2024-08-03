import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vue from '@vitejs/plugin-vue'
import {
  fileURLToPath, URL 
} from 'url'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: [ 'es2021' ],
    // outDir: resolve('dist', env.OUTPUT_DIR)
  },
  css: {
    
  },
  plugins: [ vue(), vueDevTools() ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})