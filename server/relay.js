// relay.js (ESM 버전)
import dgram from 'dgram';
import { WebSocketServer } from 'ws';

const UDP_PORT = 5005;
const UDP_HOST = '127.0.0.1';
const WS_PORT  = 8765;

const udp = dgram.createSocket('udp4');
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WS] Connected from ${ip}`);

  ws.on('message', (msg) => {
    console.log('→ UDP send:', msg.toString().slice(0, 120)); // 앞부분만 미리보기
    udp.send(Buffer.from(msg), UDP_PORT, UDP_HOST);
  });
});

console.log(`[WS] ws://0.0.0.0:${WS_PORT}  →  [UDP] ${UDP_HOST}:${UDP_PORT}`);
