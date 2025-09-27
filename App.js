
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CalculatorScreen from './screens/CalculatorScreen';
import ReportScreen from './screens/ReportScreen';
import WellsNavigator from './screens/WellsNavigator';
import AboutScreen from './screens/AboutScreen';
import { initDatabase } from './services/database';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initDatabase().catch(error => {
      console.error('Erro ao inicializar banco de dados:', error);
    });
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Calculator"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Calculator') {
              iconName = 'calculator-variant';
            } else if (route.name === 'Report') {
              iconName = 'chart-timeline-variant';
            } else if (route.name === 'Wells') {
              iconName = 'pipe';
            } else if (route.name === 'About') {
              iconName = 'information-outline';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1976D2',
          tabBarInactiveTintColor: '#6E7582',
        })}
      >
        <Tab.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'Calcular' }} />
        <Tab.Screen name="Report" component={ReportScreen} options={{ title: 'Histórico' }} />
        <Tab.Screen name="Wells" component={WellsNavigator} options={{ title: 'Poços' }} />
        <Tab.Screen name="About" component={AboutScreen} options={{ title: 'Sobre' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
