import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/common/CustomAlert';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: new Date(),
    password: '',
    confirmPassword: '',
    profileImage: null
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
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

  useEffect(() => {
    const {
      fullName,
      lastName,
      email,
      phone,
      gender,
      password,
      confirmPassword,
      profileImage
    } = formData;

    const isValid = 
      fullName.trim() !== '' &&
      lastName.trim() !== '' &&
      email.trim() !== '' &&
      phone.trim() !== '' &&
      gender !== '' &&
      password !== '' &&
      confirmPassword !== '' &&
      profileImage !== null &&
      password === confirmPassword &&
      password.length >= 6 &&
      /^(?=.*[A-Z])(?=.*\d)[\w@]{6,}$/.test(password) &&
      /^\d{10}$/.test(phone) &&
      /\S+@\S+\.\S+/.test(email) &&
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(fullName) &&
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName);

    setIsFormValid(isValid);
  }, [formData]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = "El nombre es requerido";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El nombre no debe contener números ni caracteres especiales";
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          error = "El apellido es requerido";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El apellido no debe contener números ni caracteres especiales";
        }
        break;

      case 'email':
        if (!value) {
          error = "El correo electrónico es requerido";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "El correo electrónico no es válido";
        }
        break;

      case 'phone':
        if (!value) {
          error = "El número de teléfono es requerido";
        } else if (!/^\d{10}$/.test(value)) {
          error = "El número de teléfono debe tener exactamente 10 dígitos";
        }
        break;

      case 'password':
        if (!value) {
          error = "La contraseña es requerida";
        } else if (value.length < 6) {
          error = "La contraseña debe tener al menos 6 caracteres";
        } else if (!/^(?=.*[A-Z])(?=.*\d)[\w@]{6,}$/.test(value)) {
          error = "La contraseña debe contener al menos una letra mayúscula y un número";
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          error = "Las contraseñas no coinciden";
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange('profileImage', result.assets[0].uri);
    }
  };

  const showAlert = (type, title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    handleChange('birthDate', currentDate);
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

  const handleRegister = async () => {
    if (!isFormValid) {
      showAlert('error', 'Error de validación', 'Por favor, corrige los errores en el formulario.');
      return;
    }
   
    setIsLoading(true);

    try {
      const imageBase64 = await convertImageToBase64(formData.profileImage);

      const response = await fetch('https://www.jaydey.com/ServicesMovil/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          birthDate: formatDate(formData.birthDate),
          password: formData.password,
          profileImage: imageBase64,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('success', 'Éxito', 'Registro exitoso. Se ha enviado un correo de verificación.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        showAlert('error', 'Error', data.message || "Error durante el registro.");
      }
    } catch (error) {
      showAlert('error', 'Error', "No se pudo conectar con el servidor. Por favor, inténtalo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
      </View>

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        {formData.profileImage ? (
          <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
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
        style={[styles.input, errors.fullName && styles.inputError]}
        placeholder="Ingrese su nombre completo"
        value={formData.fullName}
        onChangeText={(text) => handleChange('fullName', text)}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={[styles.input, errors.lastName && styles.inputError]}
        placeholder="Ingrese su apellido"
        value={formData.lastName}
        onChangeText={(text) => handleChange('lastName', text)}
      />
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Ingrese su correo electrónico"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Número de Teléfono</Text>
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="Ingrese su número de teléfono"
        value={formData.phone}
        onChangeText={(text) => handleChange('phone', text)}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <Text style={styles.label}>Sexo</Text>
      <RadioButton.Group 
        onValueChange={(value) => handleChange('gender', value)} 
        value={formData.gender}
      >
        <View style={styles.radioGroup}>
          <RadioButton.Item label="M" value="masculino" />
          <RadioButton.Item label="F" value="femenino" />
          <RadioButton.Item label="Otro" value="otro" />
        </View>
      </RadioButton.Group>
      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

      <Text style={styles.label}>Fecha de Nacimiento</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Seleccione su fecha de nacimiento"
          value={formData.birthDate.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Ingrese su contraseña"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? 'eye-off' : 'eye'} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <Text style={styles.passwordHint}>
        La contraseña debe tener al menos 6 caracteres, una mayúscula y un número
      </Text>

      <Text style={styles.label}>Confirmar Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Repita la contraseña"
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? 'eye-off' : 'eye'} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <Text style={styles.textregi}>
        Recuerda que al Registrarte aceptas automáticamente los términos y condiciones y el aviso de privacidad
      </Text>

      <TouchableOpacity 
        style={[
          styles.button, 
          (!isFormValid || isLoading) && styles.disabledButton
        ]} 
        onPress={handleRegister}
        disabled={!isFormValid || isLoading}
      >
        <Text style={[
          styles.buttonText,
          (!isFormValid || isLoading) && styles.disabledButtonText
        ]}>
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
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 20,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 5,
  },
  passwordHint: {
    color: 'gray',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
    paddingLeft: 5,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 30
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#666666',
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
  successText: {
    color: 'green',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  selectedRadio: {
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedRadioText: {
    color: '#000',
    fontWeight: '500',
  },
  datePickerText: {
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default RegisterScreen;