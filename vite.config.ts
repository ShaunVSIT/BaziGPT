import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    hmr: {
      port: 3001,
      overlay: true
    }
  },
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'mui-core': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
          'mui-icons': ['@mui/icons-material'],
          'mui-pickers': ['@mui/x-date-pickers'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['date-fns', 'react-i18next', 'i18next'],
          // Heavy components in separate chunks
          'html2canvas': ['html2canvas'],
          'markdown': ['react-markdown'],
          'analytics': ['@vercel/analytics', '@vercel/speed-insights', 'web-vitals']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Enable source maps for debugging (optional)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react',
      'react-dom',
      'react-router-dom'
    ]
  }
})
