// relay.js (ESM 버전)
import dgram from 'dgram';
import { WebSocketServer } from 'ws';
import os from 'os';

const UDP_PORT = 5005;
const UDP_HOST = '127.0.0.1';
const WS_PORT  = 8765;

// 로컬 IP 주소 가져오기
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4이고 내부 주소가 아닌 경우
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
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

// 서버 시작 메시지 - 크게 표시
console.log('\n' + '='.repeat(60));
console.log('📱 센서 데이터 중계 서버 시작됨');
console.log('='.repeat(60));
console.log('');
console.log('  🌐 서버 주소: ws://' + localIP + ':' + WS_PORT);
console.log('');
console.log('  📲 앱에서 이 주소를 입력하세요:');
console.log('');
console.log('     ' + localIP);
console.log('');
console.log('='.repeat(60));
console.log('');
console.log(`[UDP 송신] ${UDP_HOST}:${UDP_PORT}`);
console.log('');
