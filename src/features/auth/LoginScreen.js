import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/forms/PasswordInput';
import EmailInput from '../../components/forms/EmailInput';
import CustomAlert from '../../components/common/CustomAlert';
import WelcomeComponent from '../../components/forms/WelcomComponent';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberPassword, setRememberPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const [alertConfig, setAlertConfig] = useState({ isVisible: false, type: '', title: '', message: '', buttons: [] });

    useEffect(() => {
        loadSavedCredentials();
    }, []);

    const loadSavedCredentials = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('savedEmail');
            const savedPassword = await AsyncStorage.getItem('savedPassword');
            if (savedEmail && savedPassword) {
                setEmail(savedEmail);
                setPassword(savedPassword);
                setRememberPassword(true);
            }
        } catch (error) {
            console.error('Error al cargar las credenciales guardadas:', error);
        }
    };

    const handlePasswordChange = (newPassword) => {
        setPassword(newPassword);
    };

    const showAlert = (type, title, message, buttons) => {
        setAlertConfig({ isVisible: true, type, title, message, buttons });
    };

    const hideAlert = () => {
        setAlertConfig({ ...alertConfig, isVisible: false });
    };

    const saveCredentials = async () => {
        try {
            if (rememberPassword) {
                await AsyncStorage.setItem('savedEmail', email);
                await AsyncStorage.setItem('savedPassword', password);
            } else {
                await AsyncStorage.removeItem('savedEmail');
                await AsyncStorage.removeItem('savedPassword');
            }
        } catch (error) {
            console.error('Error al guardar las credenciales:', error);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('error', 'Error', 'Por favor, ingresa tu correo electrónico y contraseña.', [
                { text: 'OK', onPress: hideAlert }
            ]);
            return;
        }
    
        setIsLoading(true);
    
        try {
            const response = await fetch('https://www.jaydey.com/ServicesMovil/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });
    
            const data = await response.json();
            console.log('Respuesta del login:', data); // Para debug
    
            if (data.success) {
                await saveCredentials();
                // Asegúrate de que user y id_token estén estructurados correctamente
                const userData = {
                    user: {
                        ...data.user,
                        id_token: data.id_token // Incluir el token en el objeto user
                    },
                    id_token: data.id_token
                };
                await login(userData);
                navigation.navigate('HomeTabs');
            } else {
                showAlert('error', 'Error', data.message || 'Hubo un problema al iniciar sesión.', [
                    { text: 'OK', onPress: hideAlert }
                ]);
            }
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            showAlert('error', 'Error', 'Hubo un problema al conectar con el servidor. Por favor, inténtalo de nuevo.', [
                { text: 'OK', onPress: hideAlert }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <WelcomeComponent />
            <EmailInput
                value={email}
                onChangeText={setEmail}
            />
           
            <PasswordInput
                value={password}
                onChangeText={handlePasswordChange}
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

            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Cargando...' : 'Entrar'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('RecoverPassword')}>
                <Text style={styles.forgotPassword}>Recuperar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerTextRegis}>Registrate</Text></Text>
            </TouchableOpacity>

            <CustomAlert
                isVisible={alertConfig.isVisible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
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
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 3,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxInner: {
      width: 14,
      height: 14,
      backgroundColor: 'black',
      borderRadius: 2,
    },
    checkboxLabel: {
      color: 'gray',
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      marginBottom: 15,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    forgotPassword: {
      color: 'blue',
      textDecorationLine: 'underline',
      padding: 10,
    },
    buttonDisabled: {
      backgroundColor: 'gray',
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      padding: 10,
    },
    registerTextRegis: {
        fontWeight: 'bold',
        padding: 20,

    }
});

export default LoginScreen;