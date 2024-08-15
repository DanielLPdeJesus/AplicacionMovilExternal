import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permiso denegado',
          text2: 'Se necesitan permisos para acceder a la galería de imágenes.',
        });
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    console.log('Iniciando registro...');
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Las contraseñas no coinciden',
      });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }
    if (!profileImage) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor, selecciona una foto de perfil',
      });
      return;
    }

    setIsLoading(true);

    try {
      const imageBase64 = await convertImageToBase64(profileImage);

      console.log('Enviando solicitud al servidor...');
      const response = await fetch('https://jaydey.pythonanywhere.com/Authentication/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          lastName,
          email,
          phone,
          gender,
          birthDate: birthDate.toISOString(),
          password,
          profileImage: imageBase64,
        }),
      });

      console.log('Respuesta recibida:', response.status);
      const data = await response.json();
      console.log('Datos de respuesta:', data);

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: 'Registro exitoso. Se ha enviado un correo de verificación.',
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || "Error durante el registro. Por favor, inténtalo de nuevo.",
        });
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "No se pudo conectar con el servidor. Por favor, inténtalo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>
      
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Text>Seleccionar foto de perfil*</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nombre Completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su nombre completo"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su apellido"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Correo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Número de Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su número de teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Sexo</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <View style={styles.radioGroup}>
          <RadioButton.Item label="M" value="masculino" />
          <RadioButton.Item label="F" value="femenino" />
          <RadioButton.Item label="Otro" value="otro" />
        </View>
      </RadioButton.Group>

      <Text style={styles.label}>Fecha de Cumpleaños</Text>
      <TouchableOpacity onPress={showDatePickerHandler}>
        <TextInput
          style={styles.input}
          placeholder="Seleccione su fecha de cumpleaños"
          value={birthDate.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.passwordHint}>Debe contener al menos 6 caracteres</Text>

      <Text style={styles.label}>Confirmar Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Repita la contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Text style={styles.textregi}>Recuerda que al Registrarte aceptas automáticamente los términos y condiciones y el aviso de privacidad</Text>
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  passwordHint: {
    color: 'gray',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 30
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  textregi: {
    textAlign: 'center',
  },
  mandatoryField: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 100,
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

export default RegisterScreen;