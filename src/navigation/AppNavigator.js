import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../features/home/HomeScreen';
import ReservationInfoScreen from '../features/reservation/ReservationInfoScreen';
import IaScreen from '../features/hairstyle/IaScreen';
import LoginScreen from '../features/auth/LoginScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import RecoverPasswordScreen from '../features/auth/RecoverPasswordScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import ReservationScreen from '../features/reservation/ReservationScreen';
import ViewBussinesScreen from '../features/bussines/ViewBussinesScreen';
import ReservationDetailsScreen from '../features/reservation/ReservationDetailsScreen';

import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Filtros') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Reservaciones') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'pink',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: [
          {
            display: 'flex'
          },
          null
        ]
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Filtros" component={IaScreen} />
      <Tab.Screen name="Reservaciones" component={ReservationInfoScreen} />
      <Tab.Screen 
        name="Perfil" 
        component={isLoggedIn ? ProfileScreen : LoginScreen}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="HomeTabs" 
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        {!isLoggedIn && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
            <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} options={{ title: 'Recuperar Contraseña' }} />
          </>
        )}
        <Stack.Screen name="Reservation" component={ReservationScreen} options={{ title: 'Reservación' }} />
        <Stack.Screen name="ViewBussinesScreen" component={ViewBussinesScreen} options={{ title: 'Ver Negocio' }} />
        <Stack.Screen 
  name="Detalles" 
  component={ReservationDetailsScreen} 
  options={{ 
    title: 'Detalles de Reservación',
    headerBackTitle: 'Volver'
  }} 
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;