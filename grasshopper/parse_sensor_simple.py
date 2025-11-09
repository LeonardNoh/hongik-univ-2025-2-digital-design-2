"""
Grasshopper Python3 - 간단한 센서 데이터 파서
가속도와 회전 데이터만 추출

입력: json_string (string)
출력:
  - accel_x, accel_y, accel_z (float): 가속도
  - alpha, beta, gamma (float): 회전 각도 (라디안)
"""

import json

try:
    if json_string:
        data = json.loads(json_string)

        # 가속도
        accel = data.get('accel', {})
        accel_x = accel.get('x', 0)
        accel_y = accel.get('y', 0)
        accel_z = accel.get('z', 0)

        # 회전
        rotation = data.get('motion', {}).get('rotation', {})
        alpha = rotation.get('alpha', 0)  # Z축 / 요(yaw)
        beta = rotation.get('beta', 0)    # X축 / 피치(pitch)
        gamma = rotation.get('gamma', 0)  # Y축 / 롤(roll)

except Exception as e:
    print(f"Error: {e}")
