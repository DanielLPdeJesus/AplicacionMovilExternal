import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity} from 'react-native';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../features/home/HomeScreen';
import ReserScreen from '../features/reservation/ReservationInfoScreen';
import IaScreen from '../features/hairstyle/IaScreen';
import LoginScreen from '../features/auth/LoginScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import RecoverPasswordScreen from '../features/auth/RecoverPasswordScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import ReservationScreen from '../features/reservation/ReservationScreen';
import ViewScreen from '../features/bussines/ViewBussinesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = 'home-outline';
          } else if (route.name === 'Filtros') {
            iconName = 'camera-outline';
          } else if (route.name === 'Reservaciones') {
            iconName = 'calendar-outline';
          }else if (route.name === 'Perfil') {
            iconName = 'person-outline';
          }
         

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
     <Tab.Screen 
  name="Inicio" 
  component={HomeScreen} 
  options={({ navigation }) => ({
    headerTitle: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="location-outline" size={24} color="black" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Inicio</Text>
      </View>
    ),
    headerRight: () => (
      <TouchableOpacity 
        onPress={() => navigation.navigate('Notifications')}
        style={{ marginRight: 15 }}
      >
        <Ionicons name="notifications-outline" size={24} color="black" />
      </TouchableOpacity>
    ),
  })}
/>
      <Tab.Screen name="Filtros" component={IaScreen} options={{ headerTitle: 'IA' }} />
      <Tab.Screen name="Reservaciones" component={ReserScreen} />
      <Tab.Screen 
        name="Perfil" 
        component={isLoggedIn ? ProfileScreen : LoginScreen}
        options={{ headerTitle: isLoggedIn ? 'Perfil' : 'Iniciar Sesión' }}
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
        <Stack.Screen name="Reservation" component={ReservationScreen} options={{ title: 'Reservacion' }} />
        <Stack.Screen name="ViewScreen" component={ViewScreen} options={{ title: 'Ver Mas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;