import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}
