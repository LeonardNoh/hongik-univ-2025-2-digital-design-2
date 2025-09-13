// src/components/ValueRow.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { round } from '../utils/format';

type Props = { label: string; x?: number; y?: number; z?: number };

export default function ValueRow({ label, x, y, z }: Props) {
return (
<View style={styles.row}>
<Text style={styles.label}>{label}</Text>
<Text style={styles.val}>x: {round(x, 3)}</Text>
<Text style={styles.val}>y: {round(y, 3)}</Text>
<Text style={styles.val}>z: {round(z, 3)}</Text>
</View>
);
}

const styles = StyleSheet.create({
row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
label: { width: 120, fontWeight: '600' },
val: { fontVariant: ['tabular-nums'], fontFamily: 'System' }
});