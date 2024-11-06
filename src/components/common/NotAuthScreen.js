import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const NoAuthScreen = ({ navigation }) => (
  <View style={styles.noAuthContainer}>
    <Image 
      source={require('../../../assets/iconresulocion.png')} 
      style={styles.placeholderImage}
      defaultSource={require('../../../assets/iconresulocion.png')}
    />
    <Text style={styles.noAuthTitle}>¡Bienvenido!</Text>
    <Text style={styles.noAuthDescription}>
      Inicia sesión para gestionar tus reservaciones
    </Text>
    <View style={styles.authButtonsContainer}>
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerButtonText}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  noAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 60,
  },
  noAuthTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  noAuthDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  authButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  registerButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoAuthScreen;