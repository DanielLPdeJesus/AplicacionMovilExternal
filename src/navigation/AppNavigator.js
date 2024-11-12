import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { 
  Alert, 
  Linking, 
  TouchableOpacity, 
  Modal, 
  View, 
  Text, 
  StyleSheet,
  Platform,
  Dimensions 
} from 'react-native';

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
const { width } = Dimensions.get('window');

const HelpModal = ({ visible, onClose }) => {
  const handleWhatsApp = async () => {
    const phoneNumber = '9191409310';
    const message = 'Hola, necesito ayuda con la aplicación ExternalGlow...';
    
    try {
      // Primero intentamos abrir WhatsApp Web
      const webWhatsapp = `https://wa.me/52${phoneNumber}?text=${encodeURIComponent(message)}`;
      await Linking.openURL(webWhatsapp);
    } catch (err) {
      console.error('Error al abrir WhatsApp:', err);
      
      // Si falla WhatsApp Web, intentamos la app nativa
      try {
        const whatsappUrl = Platform.select({
          ios: `whatsapp://send?phone=52${phoneNumber}&text=${encodeURIComponent(message)}`,
          android: `intent://send?phone=52${phoneNumber}&text=${encodeURIComponent(message)}#Intent;package=com.whatsapp;scheme=whatsapp;end`
        });
        
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          handleEmail(); // Fallback a email si no está disponible WhatsApp
        }
      } catch (error) {
        handleEmail(); // Fallback a email si hay error
      }
    }
  };

  const handleEmail = async () => {
    const email = 'jaydeyglow@gmail.com';
    const subject = 'Ayuda con ExternalGlow';
    const body = 'Hola, necesito ayuda con lo siguiente:';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo abrir el correo electrónico. Por favor, contáctenos directamente en jaydeyglow@gmail.com',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>¿Necesita ayuda? 🤝</Text>
            <Text style={styles.modalSubtitle}>
              ¡Estamos aquí para asistirle! Elija cómo prefiere contactarnos:
            </Text>
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={24} color="white" />
            <Text style={styles.buttonText}>Contactar por WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, styles.emailButton]}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={24} color="white" />
            <Text style={styles.buttonText}>Enviar correo electrónico</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, styles.closeButton]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const HelpButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.helpButton}
        activeOpacity={0.8}
      >
        <Ionicons name="help-circle" size={24} color="white" />
      </TouchableOpacity>
      <HelpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

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
            display: 'flex',
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            height: Platform.OS === 'ios' ? 85 : 65,
          },
          null
        ],
        headerRight: () => <HelpButton />,
        headerStyle: {
          backgroundColor: 'white',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: '600',
        }
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
          headerRight: () => <HelpButton />,
          headerStyle: {
            backgroundColor: 'white',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#333',
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: '#FF69B4',
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // Color de WhatsApp
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  emailButton: {
    backgroundColor: '#FF69B4', // Color rosa para correo
  },
  closeButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  helpButton: {
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
  },
});

export default AppNavigator;