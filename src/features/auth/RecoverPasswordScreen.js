import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CustomAlert from '../../components/common/CustomAlert';
import EmailInput from '../../components/forms/EmailInput';

const RecuperarContrasenaScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isVisible: false, type: '', title: '', message: '', buttons: [] });

  const showAlert = (type, title, message, buttons) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const handleRecuperarContrasena = async () => {
    if (!email) {
      showAlert('error', 'Error', 'Por favor, ingrese su correo electrónico.', [{ text: 'OK', onPress: hideAlert }]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://www.jaydey.com/ServicesMovil/api/recuperar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('success', 'Éxito', data.message || 'Se ha enviado un correo de recuperación.', [
          { text: 'OK', onPress: () => {
            hideAlert();
            navigation.navigate('Login');
          }}
        ]);
      } else {
        throw new Error(data.error || 'Error en la solicitud');
      }
    } catch (error) {
      showAlert('error', 'Error', 'Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo más tarde.', [{ text: 'OK', onPress: hideAlert }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.helperText}>
            Ingresa tu correo electrónico para recibir instrucciones de recuperación.
          </Text>
          <EmailInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRecuperarContrasena}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Procesando...' : 'Recuperar Contraseña'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert
        isVisible={alertConfig.isVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start', 
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecuperarContrasenaScreen;
