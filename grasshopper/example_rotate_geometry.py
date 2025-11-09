"""
Grasshopper Python3 - 예제: 스마트폰 기울기로 지오메트리 회전
센서 데이터를 이용해 실시간으로 지오메트리를 회전시키는 예제

입력:
  - json_string (string): gHowl UDP Receiver 출력
  - geometry (Geometry): 회전시킬 지오메트리 (Point, Curve, Surface, Brep 등)
  - center (Point3d): 회전 중심점 (생략시 지오메트리 중심)
  - scale (float): 회전 각도 스케일 (기본값: 1.0)

출력:
  - result (Geometry): 회전된 지오메트리
  - angles_deg (Vector3d): 현재 회전 각도 (도)
  - info (string): 센서 정보
"""

import json
import math
import Rhino.Geometry as rg

def rad_to_deg(rad):
    """라디안을 도로 변환"""
    return rad * 180.0 / math.pi

try:
    if json_string and geometry:
        # JSON 파싱
        data = json.loads(json_string)
        rotation = data.get('motion', {}).get('rotation', {})

        # 회전 각도 (라디안)
        alpha = rotation.get('alpha', 0)   # Z축 회전 / 요(yaw)
        beta = rotation.get('beta', 0)     # X축 회전 / 피치(pitch)
        gamma = rotation.get('gamma', 0)   # Y축 회전 / 롤(roll)

        # 스케일 적용
        if 'scale' not in dir() or scale is None:
            scale = 1.0

        alpha *= scale
        beta *= scale
        gamma *= scale

        # 회전 중심점 설정
        if center is None:
            # BoundingBox 중심 사용
            bbox = geometry.GetBoundingBox(True)
            center = bbox.Center

        # 지오메트리 복사
        result = geometry.Duplicate()

        # 회전 변환 적용
        # 1. Z축 회전 (yaw/alpha)
        xform_z = rg.Transform.Rotation(alpha, rg.Vector3d.ZAxis, center)
        result.Transform(xform_z)

        # 2. X축 회전 (pitch/beta)
        xform_x = rg.Transform.Rotation(beta, rg.Vector3d.XAxis, center)
        result.Transform(xform_x)

        # 3. Y축 회전 (roll/gamma)
        xform_y = rg.Transform.Rotation(gamma, rg.Vector3d.YAxis, center)
        result.Transform(xform_y)

        # 출력: 각도 (도 단위)
        angles_deg = rg.Vector3d(
            rad_to_deg(alpha),
            rad_to_deg(beta),
            rad_to_deg(gamma)
        )

        # 출력: 정보
        hz = data.get('hz', 15)
        is_active = data.get('isActive', False)
        info = f"Hz: {hz} | Active: {is_active}\nα: {angles_deg.X:.1f}° β: {angles_deg.Y:.1f}° γ: {angles_deg.Z:.1f}°"

except Exception as e:
    info = f"Error: {e}"
    print(info)
