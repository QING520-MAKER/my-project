const http = require('http');
const WebSocket = require('ws');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const APPID = process.env.SPARK_APPID;
const API_SECRET = process.env.SPARK_API_SECRET;
const API_KEY = process.env.SPARK_API_KEY;
const PORT = process.env.PORT || 3000;

// 星火API配置 (与前端原有配置保持一致)
// 如果你的Key是针对其他版本的（如v2.1, v3.1），请相应修改URL和Domain
const SPARK_URL = 'wss://sparkcube-api.xf-yun.com/v1/customize'; 
const SPARK_DOMAIN = 'general';

// 生成鉴权URL
function getAuthUrl() {
  const urlObj = new URL(SPARK_URL);
  const host = urlObj.host;
  const path = urlObj.pathname;
  const date = new Date().toUTCString();
  
  const builder = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  const signatureOrigin = builder;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, API_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  
  const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
  
  return `${SPARK_URL}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`;
}

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!body) {
           throw new Error('Empty request body');
        }
        const { messages } = JSON.parse(body);
        if (!APPID || !API_SECRET || !API_KEY) {
          console.error('Missing API Credentials');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Server configuration error: Missing API Key' }));
          return;
        }
        handleChatRequest(messages, res);
      } catch (e) {
        console.error('Request parsing error:', e);
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON or Empty Body' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

function handleChatRequest(messages, res) {
  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log('Connecting to Spark API...');
  const url = getAuthUrl();
  const ws = new WebSocket(url);

  ws.on('open', () => {
    console.log('Connected to Spark API');
    const payload = {
      header: {
        app_id: APPID,
        uid: "user_default"
      },
      parameter: {
        chat: {
          domain: SPARK_DOMAIN,
          temperature: 0.5,
          max_tokens: 2048
        }
      },
      payload: {
        message: {
          text: messages
        }
      }
    };
    ws.send(JSON.stringify(payload));
  });

  ws.on('message', (data) => {
    const response = JSON.parse(data);
    if (response.header.code !== 0) {
      console.error('Spark API Error:', response.header.message);
      res.write(`data: ${JSON.stringify({ error: response.header.message })}\n\n`);
      // 不立即关闭，让前端有机会处理错误
      return;
    }

    if (response.payload && response.payload.choices && response.payload.choices.text) {
      const text = response.payload.choices.text[0].content;
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }

    if (response.header.status === 2) {
      res.write('data: [DONE]\n\n');
      res.end();
      ws.close();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Spark API Connection Error' })}\n\n`);
    res.end();
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket closed: ${code} ${reason}`);
    res.end();
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
