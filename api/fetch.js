// api/fetch.js  — Vercel Serverless Function
// CORSプロキシ: ブラウザからクロスオリジンページを取得するための中継

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URLパラメータが必要です' });
  }

  // URL validation
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: '無効なURLです' });
  }

  // HTTP/HTTPSのみ許可
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'HTTP/HTTPSのURLのみ対応しています' });
  }

  // ローカルアドレスへのアクセスを拒否
  const hostname = parsedUrl.hostname.toLowerCase();
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blocked.includes(hostname) || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return res.status(403).json({ error: 'このURLにはアクセスできません' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ai-kansoku-markdown-bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.5',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    // Content-Typeチェック
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return res.status(400).json({ error: 'HTMLページのみ変換できます（PDF・画像等は非対応）' });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: `ページの取得に失敗しました（HTTP ${response.status}）`
      });
    }

    const html = await response.text();

    // サイズ制限（2MB）
    if (html.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'ページサイズが大きすぎます（上限2MB）' });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'タイムアウトしました。ページの応答が遅い可能性があります。' });
    }
    console.error('Fetch error:', error.message);
    return res.status(500).json({ error: 'ページの取得中にエラーが発生しました: ' + error.message });
  }
}
