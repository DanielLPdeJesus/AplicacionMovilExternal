import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const RecuperarContrasenaScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const handleRecuperarContrasena = async () => {
    try {
      const response = await fetch('https://wwww.jaydey.com/ServicesMovil/api/recuperar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensajeEnviado(true);
        Alert.alert('Éxito', data.message);
      } else {
        Alert.alert('Error', data.error || 'Hubo un problema al procesar tu solicitud.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Hubo un problema de conexión. Por favor, intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Text style={styles.helperText}>
        Se le enviará un correo de recuperación
      </Text>
      {!mensajeEnviado ? (
        <TouchableOpacity style={styles.button} onPress={handleRecuperarContrasena}>
          <Text style={styles.buttonText}>Recuperar</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={styles.mensajeEnviado}>Mensaje Enviado</Text>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  helperText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mensajeEnviado: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: 'black',
  },
});

export default RecuperarContrasenaScreen;