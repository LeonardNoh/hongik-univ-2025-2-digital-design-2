// App.tsx
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import SensorDashboard from './src/screens/SensorDashboard';

export default function App() {
return (
<SafeAreaView style={{ flex: 1 }}>
<StatusBar barStyle="light-content" />
<SensorDashboard />
</SafeAreaView>
);
}