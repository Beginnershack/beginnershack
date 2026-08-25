import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// 動作確認用エンドポイント
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`)
})
