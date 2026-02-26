import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 8080

// Sert les fichiers buildés de Vite
app.use(express.static(join(__dirname, 'dist')))

// Toutes les autres routes → index.html (SPA)
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Kouizine démarré sur le port ${port}`)
})
