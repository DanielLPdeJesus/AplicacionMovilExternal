import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberPassword, setRememberPassword] = useState(false);
  
    const handleLogin = () => {
      console.log('Login attempt:', email, password);
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>
  
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.welcome}>
            Bienvenido a nuestra plataforma de inicio de sesión
          </Text>
        </View>
  
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
  
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
  
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setRememberPassword(!rememberPassword)}
          >
            {rememberPassword && <View style={styles.checkboxInner} />}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Recordar Contraseña</Text>
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
  
      <TouchableOpacity onPress={() => navigation.navigate('RecoverPassword')}>
        <Text style={styles.forgotPassword}>Recuperar contraseña</Text>
      </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'white',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    welcome: {
      marginTop: 10,
      textAlign: 'center',
      color: '#666',
      fontSize: 16,
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
      backgroundColor: '#fff',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxInner: {
      width: 16,
      height: 16,
      backgroundColor: '#007bff',
      borderRadius: 2,
    },
    checkboxLabel: {
      color: '#666',
      fontSize: 16,
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 15,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    forgotPassword: {
      color: '#007bff',
      textDecorationLine: 'underline',
      marginBottom: 15,
    },

  });

  export default LoginScreen;