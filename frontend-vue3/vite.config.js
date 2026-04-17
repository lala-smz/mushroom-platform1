import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, '.'),
  base:'/mushroom-platform/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    hmr: {
      overlay: true
    },
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3303',
        changeOrigin: true,
        timeout: 60000,
        headers: {
          'Connection': 'keep-alive'
        }
      },
      '/uploads': {
        target: 'http://localhost:3303',
        changeOrigin: true
      },
      '/mushrooms': {
        target: 'http://localhost:3303',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios', 'echarts'],
    exclude: []
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          'charts': ['echarts'],
          'utils': ['axios', 'dayjs', 'mitt', 'socket.io-client']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000
  }
})