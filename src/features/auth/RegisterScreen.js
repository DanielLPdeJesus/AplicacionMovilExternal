import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import PasswordInput from '../../components/forms/PasswordInput';
import EmailInput from '../../components/forms/EmailInput';
import CustomAlert from '../../components/common/CustomAlert';
import { Ionicons } from '@expo/vector-icons';

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
  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    type: '',
    title: '',
    message: '',
    buttons: []
  });

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('error', 'Permiso denegado', 'Se necesitan permisos para acceder a la galería de imágenes.');
      }
    })();
  }, []);

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
  };

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

  const showAlert = (type, title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "El nombre es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(fullName)) {
      newErrors.fullName = "El nombre no debe contener números ni caracteres especiales";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) {
      newErrors.lastName = "El apellido no debe contener números ni caracteres especiales";
    }

    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!phone) {
      newErrors.phone = "El número de teléfono es requerido";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "El número de teléfono debe tener exactamente 10 dígitos";
    }

    if (!gender) {
      newErrors.gender = "Por favor, selecciona un género";
    }

    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    
    if (birthDate > currentDate) {
      newErrors.birthDate = "La fecha de nacimiento no puede ser en el futuro";
    } else if (age > 90 || (age === 90 && monthDiff > 0)) {
      newErrors.birthDate = "La edad no puede ser mayor a 90 años";
    } else if (age < 13 || (age === 13 && monthDiff < 0)) {
      newErrors.birthDate = "Debes tener al menos 13 años para registrarte";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!profileImage) {
      newErrors.profileImage = "Por favor, selecciona una foto de perfil";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log('Iniciando registro...');
    if (!validateForm()) {
      showAlert('error', 'Error de validación', 'Por favor, corrige los errores en el formulario.');
      return;
    }
   
    setIsLoading(true);

    try {
      const imageBase64 = await convertImageToBase64(profileImage);

      console.log('Enviando solicitud al servidor...');
      const response = await fetch('https://www.jaydey.com/ServicesMovil/api/register', {
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
        showAlert('success', 'Éxito', 'Registro exitoso. Se ha enviado un correo de verificación.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        showAlert('error', 'Error', data.message || "Error durante el registro. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      showAlert('error', 'Error', "No se pudo conectar con el servidor. Por favor, inténtalo más tarde.");
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
      <View style={styles.header}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
      </View>

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color="#999" />
            <Text style={styles.imagePlaceholderText}>Añadir foto</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.profileImage && <Text style={styles.errorText}>{errors.profileImage}</Text>}

      <Text style={styles.label}>Nombre Completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su nombre completo"
        value={fullName}
        onChangeText={setFullName}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su apellido"
        value={lastName}
        onChangeText={setLastName}
      />
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

      <EmailInput
        value={email}
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Número de Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su número de teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <Text style={styles.label}>Sexo</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <View style={styles.radioGroup}>
          <RadioButton.Item label="M" value="masculino" />
          <RadioButton.Item label="F" value="femenino" />
          <RadioButton.Item label="Otro" value="otro" />
        </View>
      </RadioButton.Group>
      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

      <Text style={styles.label}>Fecha de Cumpleaños</Text>
      <TouchableOpacity onPress={showDatePickerHandler}>
        <TextInput
          style={styles.input}
          placeholder="Seleccione su fecha de cumpleaños"
          value={birthDate.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Contraseña</Text>
      <PasswordInput
        value={password}
        onChangeText={handlePasswordChange}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <Text style={styles.passwordHint}>Debe contener al menos 6 caracteres</Text>

      <Text style={styles.label}>Confirmar Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Repita la contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

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

      <CustomAlert
        isVisible={alertConfig.isVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  imagePickerButton: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 5,
    color: '#999',
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },
});

export default RegisterScreen;