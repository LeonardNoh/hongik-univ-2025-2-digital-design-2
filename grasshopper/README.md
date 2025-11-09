# Grasshopper 센서 데이터 파싱 스크립트

gHowl UDP Receiver로 받은 센서 데이터를 Python3 컴포넌트에서 파싱하는 스크립트 모음입니다.

## 📋 파일 목록

### 1. `parse_sensor_json.py` - 전체 데이터 파서
모든 센서 데이터를 파싱하여 Vector3d 및 기본 타입으로 출력합니다.

**입력:**
- `json_string` (string): gHowl UDP Receiver 출력

**출력:**
- `accel` (Vector3d): 가속도
- `gyro` (Vector3d): 자이로스코프
- `mag` (Vector3d): 자기계
- `rotation` (Vector3d): 회전 (alpha, beta, gamma)
- `accel_gravity` (Vector3d): 중력 포함 가속도
- `accel_pure` (Vector3d): 순수 가속도
- `rotation_rate` (Vector3d): 회전 속도
- `speed` (float): 속도
- `heading` (float): 방향
- `timestamp` (int): 타임스탬프
- `hz` (int): 샘플링 주파수
- `is_active` (bool): 센서 활성 상태

### 2. `parse_sensor_simple.py` - 간단한 파서
가장 많이 사용하는 가속도와 회전 데이터만 추출합니다.

**입력:**
- `json_string` (string)

**출력:**
- `accel_x, accel_y, accel_z` (float): 가속도
- `alpha, beta, gamma` (float): 회전 각도 (라디안)

### 3. `example_rotate_geometry.py` - 활용 예제
스마트폰 기울기로 지오메트리를 실시간 회전시키는 예제입니다.

**입력:**
- `json_string` (string): 센서 데이터
- `geometry` (Geometry): 회전시킬 지오메트리
- `center` (Point3d): 회전 중심점 (옵션)
- `scale` (float): 회전 각도 스케일 (기본값: 1.0)

**출력:**
- `result` (Geometry): 회전된 지오메트리
- `angles_deg` (Vector3d): 현재 각도 (도)
- `info` (string): 센서 정보

## 🚀 사용 방법

### 기본 설정

1. **Grasshopper에서 gHowl 설치**
   - Food4Rhino에서 gHowl 다운로드
   - Rhino에 설치

2. **UDP Receiver 설정**
   ```
   Canvas에 다음 컴포넌트 배치:

   [gHowl UDP Receiver]
     - Port: 5005
     - Enable: True (Toggle 연결)
     → Output (M): JSON 문자열
   ```

3. **Python3 컴포넌트 추가**
   ```
   [Python3 Script]
     - 입력 포트 추가: json_string
     - gHowl UDP Receiver의 Output → json_string 연결
     - 스크립트 복사/붙여넣기
   ```

4. **Timer 컴포넌트 연결** (실시간 업데이트)
   ```
   [Timer]
     - Interval: 100ms
     - Enabled: True
     → Python3 컴포넌트에 연결 (expire 트리거)
   ```

### 워크플로우 예시

#### 예시 1: 기울기로 서피스 변형

```
[gHowl UDP Receiver] (Port: 5005)
    ↓ (JSON)
[Python3: parse_sensor_simple.py]
    ↓ (alpha, beta, gamma)
[Multiply] (각도 스케일 조절)
    ↓
[Rotate] (서피스 회전)
    ↓
[Preview]
```

#### 예시 2: 가속도로 포인트 생성

```
[gHowl UDP Receiver]
    ↓
[Python3: parse_sensor_json.py]
    ↓ (accel Vector3d)
[Scale] (스케일 조절)
    ↓
[Point]
    ↓
[Sphere] (각 포인트에 구 생성)
```

#### 예시 3: 올인원 지오메트리 회전

```
[Rectangle] (기준 지오메트리)
    ↓
[gHowl UDP Receiver] → [Python3: example_rotate_geometry.py] ← [Rectangle]
    ↓                                    ↑
[Timer] (100ms)                    [Slider: scale]
    ↓
[result] → [Preview]
[angles_deg] → [Panel]
[info] → [Panel]
```

## 📐 좌표계 및 단위

### 스마트폰 좌표계
화면이 세로일 때:
- **X축**: 오른쪽 방향
- **Y축**: 위쪽 방향
- **Z축**: 화면 밖으로 나오는 방향

### 회전 각도 (Euler Angles)
- **alpha (α)**: Z축 회전 / 요(yaw) / 방위각
  - 범위: 0 ~ 2π 라디안 (0° ~ 360°)
  - 북쪽 기준 시계방향

- **beta (β)**: X축 회전 / 피치(pitch)
  - 범위: -π/2 ~ π/2 라디안 (-90° ~ 90°)
  - 앞뒤 기울기

- **gamma (γ)**: Y축 회전 / 롤(roll)
  - 범위: -π ~ π 라디안 (-180° ~ 180°)
  - 좌우 기울기

### 단위
- **각도**: 라디안 (degree 변환: `rad * 180 / π`)
- **가속도**: g (중력 가속도) 또는 m/s²
- **자기장**: µT (마이크로테슬라)
- **속도**: m/s
- **각속도**: rad/s

## 💡 활용 팁

### 1. 라디안을 도로 변환
```python
import math
degrees = radians * 180.0 / math.pi
```

### 2. 스케일 조절
센서 데이터가 너무 민감하면 스케일을 조절하세요:
```python
alpha = rotation.get('alpha', 0) * 0.5  # 50%로 감소
```

### 3. 데이터 평활화
센서 데이터에는 이미 로우패스 필터가 적용되어 있지만, 추가 평활화가 필요하면:
```python
# Grasshopper의 Average 컴포넌트 사용
# 또는 Python에서 이동평균 구현
```

### 4. Timer 주기 설정
- **실시간 반응**: 50-100ms
- **부드러운 애니메이션**: 100-200ms
- **리소스 절약**: 200-500ms

### 5. 센서 데이터 확인
처음에는 간단한 Panel 컴포넌트로 데이터 확인:
```
[Python3: parse_sensor_simple.py]
    ↓ (alpha, beta, gamma)
[Concatenate] → [Panel]
```

## ⚠️ 트러블슈팅

### 데이터가 수신되지 않을 때
1. PC에서 `node relay.js` 실행 중인지 확인
2. 앱에서 센서가 활성화(Resume)되어 있는지 확인
3. gHowl UDP Receiver의 Port가 `5005`인지 확인
4. gHowl UDP Receiver의 Enable이 `True`인지 확인

### JSON 파싱 에러
- gHowl Output이 `M (Message)` 출력에 연결되었는지 확인
- Panel로 JSON 문자열이 제대로 출력되는지 확인
- Python3 컴포넌트 사용 (GhPython 아님)

### Grasshopper가 느릴 때
- Timer 주기를 늘리세요 (예: 100ms → 200ms)
- 불필요한 출력 포트를 제거하세요
- Preview를 끄고 필요할 때만 켜세요

### 회전이 이상할 때
- 좌표계 확인: 스마트폰과 Rhino의 좌표계가 다를 수 있음
- 회전 순서 변경: alpha → beta → gamma 순서 조정
- 스케일 값 조절

## 📚 추가 자료

### 센서 데이터 형식
전체 JSON 구조는 README.md 참조

### Python3 vs GhPython
- **Python3 (CPython)**: 최신 Python, 소켓 지원, 성능 좋음 ✅
- **GhPython (IronPython)**: 구버전, 소켓 제한적 ❌

이 스크립트들은 **Python3 컴포넌트**용입니다.

### 관련 링크
- gHowl: [Food4Rhino](https://www.food4rhino.com/en/app/ghowl)
- Rhino Python: [공식 문서](https://developer.rhino3d.com/guides/rhinopython/)
