// src/screens/ServerSetup.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@server_ip';
const DEFAULT_PORT = '8765';

interface Props {
  onConnect: (ip: string) => void;
  currentIp?: string;
}

export default function ServerSetup({ onConnect, currentIp }: Props) {
  const [ip, setIp] = useState(currentIp || '');

  useEffect(() => {
    loadSavedIp();
  }, []);

  const loadSavedIp = async () => {
    try {
      const savedIp = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedIp && !currentIp) {
        setIp(savedIp);
      }
    } catch (error) {
      console.error('Failed to load saved IP:', error);
    }
  };

  const saveAndConnect = async () => {
    if (!ip.trim()) {
      Alert.alert('오류', 'IP 주소를 입력해주세요.');
      return;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, ip.trim());
      onConnect(ip.trim());
    } catch (error) {
      console.error('Failed to save IP:', error);
      Alert.alert('오류', 'IP 주소 저장에 실패했습니다.');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>서버 연결 설정</Text>
      <Text style={styles.sub}>PC에서 서버를 실행하고 표시된 IP 주소를 입력하세요</Text>

      <View style={styles.card}>
        <Text style={styles.label}>서버 IP 주소</Text>
        <TextInput
          style={styles.input}
          value={ip}
          onChangeText={setIp}
          placeholder="예: 192.168.1.100"
          placeholderTextColor="#7f93ad"
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.hint}>
          포트는 자동으로 {DEFAULT_PORT}가 사용됩니다.
        </Text>
      </View>

      <Pressable onPress={saveAndConnect} style={[styles.btn, styles.btnPrimary]}>
        <Text style={styles.btnText}>연결</Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 사용 방법</Text>
        <Text style={styles.infoText}>1. PC에서 같은 Wi-Fi 네트워크에 연결</Text>
        <Text style={styles.infoText}>2. 서버 폴더에서 "node relay.js" 실행</Text>
        <Text style={styles.infoText}>3. 표시된 IP 주소를 여기에 입력</Text>
        <Text style={styles.infoText}>4. 연결 버튼을 눌러 저장</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#0a1c47ff' },
  title: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: 4 },
  sub: { color: '#9fb0c5', marginBottom: 24, lineHeight: 20 },
  card: { backgroundColor: '#7792cdff', borderRadius: 14, padding: 16, marginBottom: 16 },
  label: { color: 'white', fontWeight: '600', marginBottom: 8, fontSize: 16 },
  input: {
    backgroundColor: '#0a1c47ff',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#3b4a70',
  },
  hint: { color: '#cde1ff', fontSize: 12, marginTop: 8 },
  btn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  btnPrimary: { backgroundColor: '#2b6cff' },
  btnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  infoBox: { backgroundColor: '#1f2a44', borderRadius: 12, padding: 16 },
  infoTitle: { color: '#ffd700', fontWeight: '600', marginBottom: 12, fontSize: 16 },
  infoText: { color: '#9fb0c5', marginBottom: 6, lineHeight: 20 },
});
