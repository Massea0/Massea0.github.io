import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- Add this line to import the 'path' module

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: { // <-- Add this 'resolve' section
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- This line defines the '@' alias
    },
  },
})