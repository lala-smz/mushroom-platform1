import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  // 关键：配置 base 路径
  base: '/mushroom-platform/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.vue', '.js', '.jsx', '.json']
  },

  server: {
    port: parseInt(process.env.VITE_PORT) || 5174,
    host: '0.0.0.0',
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3003',
        changeOrigin: true
      }
    }
  },

  optimizeDeps: {
    include: [
      'vue', 
      'vue-router', 
      'pinia', 
      'element-plus', 
      'axios'
    ],
    esbuildOptions: {
      target: 'es2015'
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        compact: true
      }
    },

    chunkSizeWarningLimit: 2000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    assetsInlineLimit: 4096
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})