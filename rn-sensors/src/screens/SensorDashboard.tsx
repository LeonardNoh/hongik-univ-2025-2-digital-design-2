// src/screens/SensorDashboard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSensors } from '../hooks/useSensors';
import { useHeadingSpeed } from '../hooks/useHeadingSpeed';
import { usePipe } from '../hooks/usePipe';
import ValueRow from '../components/ValueRow';
import { timeLabel } from '../utils/format';
import { useKeepAwake } from 'expo-keep-awake';

const WS_URL = 'ws://192.168.188.94:8765'; // ← PC의 로컬 IP로 바꿔주세요

export default function SensorDashboard() {
  useKeepAwake();
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

  usePipe({
    enabled: isActive,
    url: WS_URL,
    makePacket: () => packet,
    intervalMs: 100, // 10Hz 전송
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Sensor Dashboard</Text>
      <Text style={styles.sub}>
        Last: {timeLabel(ts)} | {hz} Hz | {isActive ? 'LIVE' : 'PAUSED'}
      </Text>

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

      <Text style={styles.tip}>Tip: 같은 Wi-Fi에 연결하고, PC의 로컬 IP로 WS_URL을 지정하세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#0a1c47ff' },
  title: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: 4 },
  sub: { color: '#9fb0c5', marginBottom: 12 },
  section: { color: '#cde1ff', fontWeight: '600', marginBottom: 6 },
  card: { backgroundColor: '#7792cdff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#1f2a44' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2b6cff', borderColor: '#2b6cff' },
  btnDanger: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' },
  btnActive: { backgroundColor: '#1f2a44', borderColor: '#3b4a70' },
  btnGhost: { backgroundColor: 'transparent', borderColor: '#3b4a70' },
  btnText: { color: 'white', fontWeight: '600' },
  tip: { color: '#7f93ad', marginTop: 16 }
});
