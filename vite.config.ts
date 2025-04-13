import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    proxy:{
      '/api': {
        target:'http://106.55.62.201:8080',
        // target:'http://sakit.usemock.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
