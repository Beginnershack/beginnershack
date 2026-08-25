import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('読み込み中...')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('バックエンドに接続できませんでした（先に backend を起動してください）'))
  }, [])

  return (
    <div className="app">
      <h1>React + Node.js 初期構成</h1>
      <p>バックエンドからのメッセージ: <strong>{message}</strong></p>
    </div>
  )
}

export default App
