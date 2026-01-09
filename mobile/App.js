import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Mic, GraduationCap, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

// Placeholder Screens
import TalkmeScreen from './screens/TalkmeScreen';
import AcademyScreen from './screens/AcademyScreen';
// Simple placeholder for Profile
import { View, Text } from 'react-native';
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Perfil de Usuario (Próximamente)</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0f172a', // Slate 900
              borderTopColor: '#1e293b',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8
            },
            tabBarActiveTintColor: '#06b6d4', // Cyan 500
            tabBarInactiveTintColor: '#64748b', // Slate 500
          }}
        >
          <Tab.Screen
            name="Talkme"
            component={TalkmeScreen}
            options={{
              tabBarLabel: 'Talkme',
              tabBarIcon: ({ color, size }) => <Mic color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Academy"
            component={AcademyScreen}
            options={{
              tabBarLabel: 'Academia',
              tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Perfil',
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </Tab.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
