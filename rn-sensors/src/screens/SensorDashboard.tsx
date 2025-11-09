// src/screens/SensorDashboard.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSensors } from '../hooks/useSensors';
import { useHeadingSpeed } from '../hooks/useHeadingSpeed';
import { usePipe } from '../hooks/usePipe';
import ValueRow from '../components/ValueRow';
import { timeLabel } from '../utils/format';
import { useKeepAwake } from 'expo-keep-awake';
import ServerSetup from './ServerSetup';

const DEFAULT_PORT = '8765';

export default function SensorDashboard() {
  useKeepAwake();
  const [serverIp, setServerIp] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { isActive, toggle, hz, setHz, accel, gyro, mag, motion, ts } = useSensors(30);
  const { speedMs, headingRad } = useHeadingSpeed(motion?.rotation);

  const packet = useMemo(() => ({
    ts, hz, isActive,
    accel, gyro, mag,
    motion: {
      rotation: motion?.rotation,                                  // {alpha,beta,gamma}
      accelerationIncludingGravity: motion?.accelerationIncludingGravity,  // {x,y,z}
      acceleration: motion?.acceleration,                          // {x,y,z}
      rotationRate: motion?.rotationRate,                          // {alpha,beta,gamma} rad/s
    },
    derived: {
      headingRad,              // 이동 방향(요), 라디안
      speedMs,                 // 속도 m/s (GPS 기반)
    },
  }), [ts, hz, isActive, accel, gyro, mag, motion, speedMs, headingRad]);

  const wsUrl = serverIp ? `ws://${serverIp}:${DEFAULT_PORT}` : null;

  usePipe({
    enabled: isActive && !!wsUrl,
    url: wsUrl || '',
    makePacket: () => packet,
    intervalMs: 100, // 10Hz 전송
  });

  const handleConnect = (ip: string) => {
    setServerIp(ip);
    setShowSettings(false);
  };

  // 서버가 설정되지 않았으면 설정 화면 표시
  if (!serverIp || showSettings) {
    return <ServerSetup onConnect={handleConnect} currentIp={serverIp || undefined} />;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sensor Dashboard</Text>
          <Text style={styles.sub}>
            Last: {timeLabel(ts)} | {hz} Hz | {isActive ? 'LIVE' : 'PAUSED'}
          </Text>
        </View>
        <Pressable onPress={() => setShowSettings(true)} style={styles.settingsBtn}>
          <Text style={styles.settingsText}>⚙️</Text>
        </Pressable>
      </View>

      <Text style={styles.serverInfo}>서버: {serverIp}:{DEFAULT_PORT}</Text>

      <View style={styles.card}>
        <ValueRow label="Accelerometer (g)"    x={accel.x} y={accel.y} z={accel.z} />
        <ValueRow label="Gyroscope (rad/s)"    x={gyro.x}  y={gyro.y}  z={gyro.z}  />
        <ValueRow label="Magnetometer (µT)"    x={mag.x}   y={mag.y}   z={mag.z}   />
        <View style={{ height: 8 }} />
        <Text style={styles.section}>DeviceMotion</Text>
        <ValueRow label="Rotation (αβγ)"       x={motion?.rotation?.alpha} y={motion?.rotation?.beta} z={motion?.rotation?.gamma} />
        <ValueRow label="Accel+Gravity"        x={motion?.accelerationIncludingGravity?.x} y={motion?.accelerationIncludingGravity?.y} z={motion?.accelerationIncludingGravity?.z} />
        <ValueRow label="Acceleration"         x={motion?.acceleration?.x} y={motion?.acceleration?.y} z={motion?.acceleration?.z} />
        <View style={{ height: 8 }} />
        <ValueRow label="Derived"              x={headingRad} y={speedMs} z={undefined} />
      </View>

      <View style={styles.row}>
        <Pressable onPress={toggle} style={[styles.btn, isActive ? styles.btnDanger : styles.btnPrimary]}>
          <Text style={styles.btnText}>{isActive ? 'Pause' : 'Resume'}</Text>
        </Pressable>
        {[15, 30, 60].map((r) => (
          <Pressable key={r} onPress={() => setHz(r as any)} style={[styles.btn, hz === r ? styles.btnActive : styles.btnGhost]}>
            <Text style={styles.btnText}>{r} Hz</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#0a1c47ff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: 4 },
  sub: { color: '#9fb0c5', marginBottom: 12 },
  settingsBtn: { padding: 8, backgroundColor: '#1f2a44', borderRadius: 8 },
  settingsText: { fontSize: 20 },
  serverInfo: { color: '#ffd700', marginBottom: 12, fontSize: 13 },
  section: { color: '#cde1ff', fontWeight: '600', marginBottom: 6 },
  card: { backgroundColor: '#7792cdff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#1f2a44' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2b6cff', borderColor: '#2b6cff' },
  btnDanger: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' },
  btnActive: { backgroundColor: '#1f2a44', borderColor: '#3b4a70' },
  btnGhost: { backgroundColor: 'transparent', borderColor: '#3b4a70' },
  btnText: { color: 'white', fontWeight: '600' },
});
