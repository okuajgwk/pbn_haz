import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const isAnonymous = !user || user.isAnonymous;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#222',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#00ffff',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 1,
        },
      }}
    >
      {/* Tab 1 — Scanner, vizibil pentru toți */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'SCAN',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📷</Text>
          ),
        }}
      />

      {/* Tab 2 — Echipă, vizibil DOAR pentru useri logați (ARTIST) */}
      <Tabs.Screen
        name="team"
        options={{
          title: 'ECHIPĂ',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color: isAnonymous ? '#333' : color }}>
              👥
            </Text>
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ fontSize: 10, color: isAnonymous ? '#333' : color, letterSpacing: 1 }}>
              {isAnonymous ? 'LOCKED' : 'ECHIPĂ'}
            </Text>
          ),
          // Dacă e VANDAL, îi blocăm navigarea pe team
          tabBarButton: isAnonymous
            ? () => (
                <View style={styles.lockedTab}>
                  <Text style={{ fontSize: 20, color: '#333' }}>👥</Text>
                  <Text style={styles.lockedLabel}>LOCKED</Text>
                </View>
              )
            : undefined,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  lockedTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    opacity: 0.4,
  },
  lockedLabel: {
    fontSize: 10,
    color: '#555',
    letterSpacing: 1,
    marginTop: 2,
  },
});