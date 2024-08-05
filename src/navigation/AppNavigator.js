import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import RecoverPasswordScreen from '../screens/RecoverPasswordScreen';
import ReservationScreen from '../screens/ReservationScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerLeft: null }} />
        <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} options={{ title: 'Recuperar Contraseña' }} /> 
        <Stack.Screen name="Reservation" component={ReservationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;