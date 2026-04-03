# markdown.ai-kansoku.com

URLを入れるだけでAIに読まれやすいMarkdownを生成・DLするツール。

## 構成

```
markdown-tool/
├── api/
│   └── fetch.js        # Vercel Functions（CORSプロキシ）
├── public/
│   └── index.html      # SPA本体
├── vercel.json
└── README.md
```

## 技術スタック

- **フロント**: Vanilla HTML/CSS/JS（依存ゼロ）
- **ライブラリ**: Readability.js + Turndown.js（CDN経由）
- **バックエンド**: Vercel Functions 1本（CORSプロキシのみ）
- **非対応**: Wix・STUDIO・Webflow等のSPA（JS描画コンテンツ）

## デプロイ手順

### 1. GitHubにpush

```bash
cd markdown-tool
git init
git remote add origin git@github.com:tomishimamoto-ai/markdown-ai-kansoku.git
git add .
git commit -m "feat: initial deploy"
git push -u origin main
```

### 2. Vercelプロジェクト作成

1. vercel.com → New Project → Import `markdown-ai-kansoku`
2. Framework Preset: **Other**
3. Root Directory: `.`（デフォルト）
4. デプロイ

### 3. カスタムドメイン設定

1. Vercel → Settings → Domains → `markdown.ai-kansoku.com` を追加
2. ConohaWING DNS管理 → CNAMEレコード追加:
   - ホスト名: `markdown`
   - 値: `cname.vercel-dns.com`
3. SSL自動発行を確認（数分〜）

## ローカル確認

```bash
npm i -g vercel
vercel dev
```

→ http://localhost:3000 で確認

## 注意事項

- `api/fetch.js` は10秒タイムアウト・2MB上限を設定済み
- ローカルIPへのアクセス（SSRF）を拒否する実装済み
- SPA（JS描画）サイトはReadabilityで中身が取れないため非対応と明記
