import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, TouchableOpacity } from 'react-native';

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
import CommentsScreen from '../features/bussines/CommentsScreen';
import TermsAndPrivacyScreen from '../features/bussines/TermsAndPrivacyScreen';

import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const handleHelp = () => {
  Alert.alert(
    '¿Necesitas ayuda? 🤝',
    '¡Estamos aquí para asistirte! Elige cómo prefieres contactarnos:',
    [
      {
        text: '🤳 WhatsApp',
        style: 'default',
        onPress: () => {
          const phoneNumber = '9191409310';
          const message = 'Hola, necesito ayuda con la aplicación ExternalGlow...';
          const whatsappUrl = `whatsapp://send?phone=52${phoneNumber}&text=${encodeURIComponent(message)}`;
          
          Linking.canOpenURL(whatsappUrl)
            .then(supported => {
              if (supported) {
                return Linking.openURL(whatsappUrl);
              } else {
                Alert.alert(
                  '❌ WhatsApp no disponible',
                  'Parece que no tienes WhatsApp instalado. ¿Te gustaría intentar otra opción?',
                  [
                    {
                      text: '📧 Usar correo',
                      onPress: () => {
                        const email = 'jaydeyglow@gmail.com';
                        Linking.openURL(`mailto:${email}`);
                      }
                    },
                    {
                      text: 'Cancelar',
                      style: 'cancel'
                    }
                  ]
                );
              }
            })
            .catch(err => {
              console.error('Error al abrir WhatsApp:', err);
              Alert.alert(
                'Error de conexión',
                'No pudimos abrir WhatsApp. Por favor, intenta con otra opción.',
                [
                  {text: 'OK', style: 'default'}
                ]
              );
            });
        }
      },
      {
        text: '✉️ Correo electrónico',
        style: 'default',
        onPress: () => {
          const email = 'jaydeyglow@gmail.com';
          const subject = 'Ayuda con ExternalGlow';
          const body = 'Hola, necesito ayuda con lo siguiente:';
          const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          
          Linking.canOpenURL(emailUrl)
            .then(supported => {
              if (supported) {
                return Linking.openURL(emailUrl);
              } else {
                Alert.alert(
                  '❌ Correo no configurado',
                  'No encontramos una aplicación de correo configurada. ¿Te gustaría intentar WhatsApp?',
                  [
                    {
                      text: '🤳 Usar WhatsApp',
                      onPress: () => {
                        const whatsappUrl = `whatsapp://send?phone=529191409310`;
                        Linking.openURL(whatsappUrl);
                      }
                    },
                    {
                      text: 'Cancelar',
                      style: 'cancel'
                    }
                  ]
                );
              }
            })
            .catch(err => {
              console.error('Error al abrir el correo:', err);
              Alert.alert(
                'Error de conexión',
                'No pudimos abrir el correo. Por favor, intenta con otra opción.',
                [
                  {text: 'OK', style: 'default'}
                ]
              );
            });
        }
      },
      {
        text: '❌ Cerrar',
        style: 'cancel'
      }
    ],
    {
      cancelable: true
    }
  );
};

const HelpButton = () => (
  <TouchableOpacity
    onPress={handleHelp}
    style={{
      marginRight: 15,
      backgroundColor: '#FF69B4',
      padding: 8,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}
  >
    <Ionicons name="help-circle" size={24} color="white" />
  </TouchableOpacity>
);

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
        ],
        headerRight: () => <HelpButton />
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
      <Stack.Navigator
        screenOptions={{
          headerRight: () => <HelpButton />
        }}
      >
        <Stack.Screen 
          name="HomeTabs" 
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        {!isLoggedIn && (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Registro' }} 
            />
            <Stack.Screen 
              name="RecoverPassword" 
              component={RecoverPasswordScreen} 
              options={{ title: 'Recuperar Contraseña' }} 
            />
          </>
        )}
        <Stack.Screen 
          name="Reservation" 
          component={ReservationScreen} 
          options={{ title: 'Reservación' }} 
        />
        <Stack.Screen 
          name="ViewBussinesScreen" 
          component={ViewBussinesScreen} 
          options={{ title: 'Ver Negocio' }} 
        />
        <Stack.Screen 
          name="CommentsScreen" 
          component={CommentsScreen} 
          options={{ title: 'Comentarios Negocio'}}
        />
        <Stack.Screen 
          name="Detalles" 
          component={ReservationDetailsScreen} 
          options={{ 
            title: 'Detalles de Reservación',
            headerBackTitle: 'Volver'
          }} 
        />
        <Stack.Screen 
          name="TermsAndPrivacy" 
          component={TermsAndPrivacyScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;