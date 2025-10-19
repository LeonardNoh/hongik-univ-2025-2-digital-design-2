// src/hooks/usePipe.ts
import { useEffect, useRef } from 'react';

type Packet = Record<string, any>;

export function usePipe({
  enabled,
  url,
  makePacket,
  intervalMs = 100,
}: {
  enabled: boolean;
  url: string;
  makePacket: () => Packet;
  intervalMs?: number;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<any>(null);
  const makePacketRef = useRef(makePacket);

  // 최신 makePacket을 ref에만 저장 (메인 이펙트 deps에서 제외)
  useEffect(() => {
    makePacketRef.current = makePacket;
  }, [makePacket]);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // 연결 1번만 열고, interval은 ref의 최신 함수를 사용
      timerRef.current = setInterval(() => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            const pkt = makePacketRef.current();
            ws.send(JSON.stringify(pkt));
          }
        } catch {}
      }, intervalMs);
    };

    ws.onclose = () => {};
    ws.onerror = () => {};

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, url, intervalMs]); // ✨ makePacket 제거
}
