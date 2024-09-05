import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity} from 'react-native';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import ReserScreen from '../screens/ReserScreen';
import IaScreen from '../screens/IaScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RecoverPasswordScreen from '../screens/RecoverPasswordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReservationScreen from '../screens/ReservationScreen';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;