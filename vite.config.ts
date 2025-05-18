import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    proxy:{
      '/api': {
        target:'http://64fe77f1.r31.cpolar.top',
        // target:'http://sakit.usemock.com',
        changeOrigin: true,
      }
    }
  }
})
