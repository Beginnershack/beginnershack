# myapp

React（フロントエンド, Vite）+ Node.js/Express（バックエンド）構成の初期セットアップです。

## フォルダ構成

```
myapp/
├── frontend/   # React (Vite)
└── backend/    # Node.js (Express)
```

## セットアップ手順

このプロジェクトは `npm install` がまだ実行されていません（このチャット環境にネットワークアクセスがないため）。
お使いの端末にダウンロードした後、以下を実行してください。

### 1. バックエンドの起動

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

`http://localhost:3001` で起動します。

### 2. フロントエンドの起動（別ターミナル）

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` で起動します。`/api` へのリクエストはバックエンド（3001番ポート）へ自動でプロキシされます。

動作確認: フロントエンドを開くと「Hello from backend!」というメッセージが表示されれば、両者の疎通ができています。

## 技術スタック

- フロントエンド: React 18, Vite 5
- バックエンド: Node.js, Express 4, CORS, dotenv
