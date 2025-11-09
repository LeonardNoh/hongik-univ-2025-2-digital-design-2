"""
Grasshopper Python3 - JSON 센서 데이터 파서
gHowl UDP Receiver에서 받은 JSON 문자열을 파싱합니다.

입력:
  - json_string (string): gHowl UDP Receiver의 출력

출력:
  - accel (Vector3d): 가속도 (x, y, z)
  - gyro (Vector3d): 자이로스코프 (x, y, z)
  - mag (Vector3d): 자기계 (x, y, z)
  - rotation (Vector3d): 회전 (alpha, beta, gamma) 라디안
  - accel_gravity (Vector3d): 중력 포함 가속도 (x, y, z)
  - accel_pure (Vector3d): 순수 가속도 (x, y, z)
  - rotation_rate (Vector3d): 회전 속도 (alpha, beta, gamma)
  - speed (float): 속도 (m/s)
  - heading (float): 방향 (라디안)
  - timestamp (int): 타임스탬프
  - hz (int): 샘플링 주파수
  - is_active (bool): 센서 활성 상태
"""

import json
import Rhino.Geometry as rg

# JSON 파싱
try:
    if json_string:
        data = json.loads(json_string)

        # 가속도계 (로우패스 필터 적용됨)
        accel_data = data.get('accel', {})
        accel = rg.Vector3d(
            accel_data.get('x', 0),
            accel_data.get('y', 0),
            accel_data.get('z', 0)
        )

        # 자이로스코프 (로우패스 필터 적용됨)
        gyro_data = data.get('gyro', {})
        gyro = rg.Vector3d(
            gyro_data.get('x', 0),
            gyro_data.get('y', 0),
            gyro_data.get('z', 0)
        )

        # 자기계 (로우패스 필터 적용됨)
        mag_data = data.get('mag', {})
        mag = rg.Vector3d(
            mag_data.get('x', 0),
            mag_data.get('y', 0),
            mag_data.get('z', 0)
        )

        # 모션 데이터
        motion = data.get('motion', {})

        # 회전 (Euler angles)
        rotation_data = motion.get('rotation', {})
        rotation = rg.Vector3d(
            rotation_data.get('alpha', 0),   # Z축 회전 / 요(yaw)
            rotation_data.get('beta', 0),    # X축 회전 / 피치(pitch)
            rotation_data.get('gamma', 0)    # Y축 회전 / 롤(roll)
        )

        # 중력 포함 가속도
        accel_grav_data = motion.get('accelerationIncludingGravity', {})
        accel_gravity = rg.Vector3d(
            accel_grav_data.get('x', 0),
            accel_grav_data.get('y', 0),
            accel_grav_data.get('z', 0)
        )

        # 순수 가속도 (중력 제외)
        accel_pure_data = motion.get('acceleration', {})
        accel_pure = rg.Vector3d(
            accel_pure_data.get('x', 0),
            accel_pure_data.get('y', 0),
            accel_pure_data.get('z', 0)
        )

        # 회전 속도
        rot_rate_data = motion.get('rotationRate', {})
        rotation_rate = rg.Vector3d(
            rot_rate_data.get('alpha', 0),
            rot_rate_data.get('beta', 0),
            rot_rate_data.get('gamma', 0)
        )

        # 파생 데이터
        derived = data.get('derived', {})
        speed = derived.get('speedMs', 0)
        heading = derived.get('headingRad', 0)

        # 메타 정보
        timestamp = data.get('ts', 0)
        hz = data.get('hz', 15)
        is_active = data.get('isActive', False)

except Exception as e:
    print(f"Parse error: {e}")
