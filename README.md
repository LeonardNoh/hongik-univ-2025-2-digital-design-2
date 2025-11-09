# hongik-univ-2025-2-digital-design-2

홍익대학교 2025-2 디지털디자인2 수업 리포지토리

## 📱 센서 데이터 수집 앱 (rn-sensors)

스마트폰의 센서 데이터를 실시간으로 Grasshopper에 전송하는 React Native 앱입니다.

### 사용 방법

#### 1. 서버 실행 (PC)

먼저 PC에서 중계 서버를 실행합니다:

```bash
cd server
npm install  # 처음 한 번만 실행
node relay.js
```

서버가 시작되면 다음과 같이 IP 주소가 표시됩니다:

```
============================================================
📱 센서 데이터 중계 서버 시작됨
============================================================

  🌐 서버 주소: ws://192.168.1.100:8765

  📲 앱에서 이 주소를 입력하세요:

     192.168.1.100

============================================================
```

#### 2. 앱 실행 (스마트폰)

```bash
cd rn-sensors
npm install  # 처음 한 번만 실행
npx expo start
```

Expo Go 앱에서 QR 코드를 스캔하여 앱을 실행합니다.

#### 3. 서버 연결

앱을 처음 실행하면 서버 설정 화면이 나타납니다:

1. 서버 콘솔에 표시된 IP 주소를 입력
2. 연결 버튼을 누르면 IP 주소가 저장되고 센서 화면으로 이동합니다

#### 4. Grasshopper에서 데이터 수신

Grasshopper에서 UDP 수신 컴포넌트(GHowl, Bengesht 등)를 사용하여 `127.0.0.1:5005`로 전송되는 데이터를 수신합니다.

### 요구사항

- **PC**: Node.js 20 이상
- **스마트폰**: Expo Go 앱 설치
- **네트워크**: PC와 스마트폰이 같은 Wi-Fi 네트워크에 연결

### 전송되는 데이터

```json
{
  "ts": "timestamp",
  "hz": 30,
  "isActive": true,
  "accel": { "x": 0, "y": 0, "z": 9.8 },
  "gyro": { "x": 0, "y": 0, "z": 0 },
  "mag": { "x": 0, "y": 0, "z": 0 },
  "motion": {
    "rotation": { "alpha": 0, "beta": 0, "gamma": 0 },
    "accelerationIncludingGravity": { "x": 0, "y": 0, "z": 0 },
    "acceleration": { "x": 0, "y": 0, "z": 0 },
    "rotationRate": { "alpha": 0, "beta": 0, "gamma": 0 }
  },
  "derived": {
    "headingRad": 0,
    "speedMs": 0
  }
}
```

### 트러블슈팅

- **연결이 안 될 때**: PC와 스마트폰이 같은 Wi-Fi에 연결되어 있는지 확인
- **IP 주소 변경**: 앱 화면 우측 상단의 ⚙️ 버튼을 눌러 다시 설정
- **데이터가 안 올 때**: 앱에서 'Resume' 버튼을 눌러 센서 활성화

---

## 📦 TestFlight로 iOS 앱 배포하기

학생들에게 앱을 배포하려면 TestFlight를 사용하는 것이 가장 간편합니다.

### 사전 준비

1. **Apple Developer 계정** ($99/년)
   - [developer.apple.com](https://developer.apple.com)에서 가입

2. **Expo 계정** (무료)
   - [expo.dev](https://expo.dev)에서 가입

3. **EAS CLI 설치** (이미 설치됨)
   ```bash
   npm install -g eas-cli
   ```

### 1. Expo 로그인

```bash
cd rn-sensors
eas login
```

Expo 계정으로 로그인합니다.

### 2. 프로젝트 설정

```bash
eas build:configure
```

프로젝트를 EAS Build에 연결합니다.

### 3. iOS 빌드 생성

**처음 빌드할 때:**

```bash
eas build --platform ios
```

명령어 실행 중에 다음을 물어봅니다:
- Apple ID 입력
- Apple Team ID 선택
- Provisioning Profile 및 Certificate 생성 (자동)

**TestFlight용 프로덕션 빌드:**

```bash
eas build --platform ios --profile production
```

빌드가 완료되면 (약 10-20분 소요) 다운로드 링크가 제공됩니다.

### 4. App Store Connect에 자동 제출

```bash
eas submit --platform ios
```

또는 수동으로:
1. [App Store Connect](https://appstoreconnect.apple.com)에서 새 앱 등록
2. EAS Build에서 다운로드한 `.ipa` 파일 업로드
3. TestFlight 탭에서 테스터 추가

### 5. 테스터 추가

App Store Connect > TestFlight에서:
1. **내부 테스팅** 그룹 생성
2. 학생들의 Apple ID 이메일 추가 (최대 100명)
3. 테스터들에게 TestFlight 초대 이메일 발송

학생들은:
1. TestFlight 앱 설치 (App Store에서 무료)
2. 초대 이메일의 링크 클릭
3. TestFlight에서 앱 다운로드

### 6. 앱 업데이트

코드 수정 후:

```bash
# app.json의 version과 ios.buildNumber 업데이트
# 예: "1.0.0" → "1.0.1"

eas build --platform ios --profile production
eas submit --platform ios
```

### 주의사항

- **Bundle Identifier**: `com.hongik.rnsensors` (수정 가능)
- **첫 빌드는 승인 대기**: Apple 검토 후 TestFlight 사용 가능 (1-2일)
- **내부 테스터 제한**: 최대 100명
- **외부 테스터**: 최대 10,000명 (Apple 검토 필요)

### eas.json 설정

프로젝트에 이미 설정되어 있습니다:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### 비용

- **Apple Developer**: $99/년 (필수)
- **EAS Build**: 무료 플랜에서 월 30회 빌드 가능
  - 더 많은 빌드 필요 시 유료 플랜 ($29/월~)

### 학생들 사용 방법

1. TestFlight 앱 설치
2. 초대 이메일의 링크 클릭
3. TestFlight에서 "Sensor Dashboard" 설치
4. 앱 실행 후 서버 IP 입력
