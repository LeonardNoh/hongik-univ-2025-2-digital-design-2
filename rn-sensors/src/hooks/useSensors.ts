// src/hooks/useSensors.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Accelerometer, Gyroscope, Magnetometer, DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

export type SensorRates = 15 | 30 | 60; // Hz

export function useSensors(initialHz: SensorRates = 30) {
const [isActive, setIsActive] = useState(true);
const [hz, setHz] = useState<SensorRates>(initialHz);

const [accel, setAccel] = useState<{ x?: number; y?: number; z?: number }>({});
const [gyro, setGyro] = useState<{ x?: number; y?: number; z?: number }>({});
const [mag, setMag] = useState<{ x?: number; y?: number; z?: number }>({});
const [motion, setMotion] = useState<DeviceMotionMeasurement | null>(null);
const [ts, setTs] = useState<number>(Date.now());

// 간단한 로우패스 필터(노이즈 감소용)
const last = useRef({ a: { x: 0, y: 0, z: 0 }, g: { x: 0, y: 0, z: 0 }, m: { x: 0, y: 0, z: 0 } });
const alpha = 0.25; // 0~1 (작을수록 더 부드러움)

const applyLPF = useCallback((prev: number, next?: number) => {
if (typeof next !== 'number') return prev;
return prev + alpha * (next - prev);
}, []);

// 샘플링 주기 적용(ms)
useEffect(() => {
const intervalMs = Math.max(16, Math.round(1000 / hz));
Accelerometer.setUpdateInterval(intervalMs);
Gyroscope.setUpdateInterval(intervalMs);
Magnetometer.setUpdateInterval(intervalMs);
DeviceMotion.setUpdateInterval(intervalMs);
}, [hz]);

useEffect(() => {
let accelSub: any, gyroSub: any, magSub: any, motionSub: any;
if (isActive) {
accelSub = Accelerometer.addListener(({ x, y, z }) => {
last.current.a.x = applyLPF(last.current.a.x, x);
last.current.a.y = applyLPF(last.current.a.y, y);
last.current.a.z = applyLPF(last.current.a.z, z);
setAccel({ ...last.current.a });
setTs(Date.now());
});
gyroSub = Gyroscope.addListener(({ x, y, z }) => {
last.current.g.x = applyLPF(last.current.g.x, x);
last.current.g.y = applyLPF(last.current.g.y, y);
last.current.g.z = applyLPF(last.current.g.z, z);
setGyro({ ...last.current.g });
});
magSub = Magnetometer.addListener(({ x, y, z }) => {
last.current.m.x = applyLPF(last.current.m.x, x);
last.current.m.y = applyLPF(last.current.m.y, y);
last.current.m.z = applyLPF(last.current.m.z, z);
setMag({ ...last.current.m });
});
motionSub = DeviceMotion.addListener((m) => setMotion(m));
}
return () => {
accelSub?.remove?.();
gyroSub?.remove?.();
magSub?.remove?.();
motionSub?.remove?.();
};
}, [isActive, applyLPF]);

const toggle = useCallback(() => setIsActive((v) => !v), []);

return useMemo(
() => ({ isActive, toggle, hz, setHz, accel, gyro, mag, motion, ts }),
[isActive, toggle, hz, accel, gyro, mag, motion, ts]
);
}