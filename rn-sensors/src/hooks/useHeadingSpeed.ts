// src/hooks/useHeadingSpeed.ts
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { DeviceMotionMeasurement } from 'expo-sensors';

export function useHeadingSpeed(rotation?: DeviceMotionMeasurement['rotation']) {
  const [speedMs, setSpeedMs] = useState<number>(0);
  const [headingRad, setHeadingRad] = useState<number>(0);

  // heading: DeviceMotion.rotation.alpha (Z, rad)
  useEffect(() => {
    if (rotation?.alpha != null) setHeadingRad(rotation.alpha);
  }, [rotation?.alpha]);

  // speed: Location
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 250, distanceInterval: 0.5 },
        (loc) => {
          // Android는 loc.coords.speed(m/s)를 주는 편, iOS는 상황에 따라 0일 수 있음
          if (typeof loc.coords.speed === 'number' && !Number.isNaN(loc.coords.speed)) {
            setSpeedMs(Math.max(0, loc.coords.speed));
          }
        }
      );
    })();
    return () => sub?.remove();
  }, []);

  return { speedMs, headingRad };
}
