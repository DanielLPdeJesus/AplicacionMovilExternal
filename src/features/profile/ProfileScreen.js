import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import CustomAlert from '../../components/common/CustomAlert';

const API_URL = 'https://www.jaydey.com/ServicesMovil';

const ProfileScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    type: '',
    title: '',
    message: '',
    buttons: []
  });

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    const d = new Date(date);
    const year = d.getFullYear();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } else if (user) {
      const formattedUser = {
        ...user,
        birth_date: user.birth_date ? formatDate(user.birth_date) : null
      };
      setUserData(formattedUser);
      setEditedUser(formattedUser);
      setIsLoading(false);
    }
  }, [isLoggedIn, user, navigation]);

  const validateField = (name, value) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    switch (name) {
      case 'full_name':
        if (!value) {
          return "El nombre es requerido";
        } else if (!nameRegex.test(value)) {
          return "El nombre no debe contener números ni caracteres especiales";
        }
        return "";

      case 'last_name':
        if (!value) {
          return "El apellido es requerido";
        } else if (!nameRegex.test(value)) {
          return "El apellido no debe contener números ni caracteres especiales";
        }
        return "";

      case 'phone_number':
        if (value && !/^\d{10}$/.test(value)) {
          return "El número de teléfono debe tener exactamente 10 dígitos";
        }
        return "";

      case 'birth_date':
        if (!value) {
          return "La fecha de nacimiento es requerida";
        }
        const currentDate = new Date();
        const selectedDate = parseDate(value);
        const age = currentDate.getFullYear() - selectedDate.getFullYear();
        const monthDiff = currentDate.getMonth() - selectedDate.getMonth();
        
        if (selectedDate > currentDate) {
          return "La fecha de nacimiento no puede ser en el futuro";
        } else if (age > 90 || (age === 90 && monthDiff > 0)) {
          return "La edad no puede ser mayor a 90 años";
        } else if (age < 13 || (age === 13 && monthDiff < 0)) {
          return "Debes tener al menos 13 años para registrarte";
        }
        return "";

      case 'gender':
        if (!value) {
          return "El género es requerido";
        }
        return "";

      default:
        return "";
    }
  };

  const handleFieldChange = (name, value) => {
    const newEditedUser = { ...editedUser, [name]: value };
    setEditedUser(newEditedUser);
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const fields = ['full_name', 'last_name', 'phone_number', 'birth_date', 'gender'];
    
    fields.forEach(field => {
      const error = validateField(field, editedUser[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeTabs' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showAlert('error', 'Error', 'No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const showAlert = (type, title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showAlert('error', 'Error de validación', 'Por favor, corrija los errores en el formulario.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.uid,
          nombre_usuario: editedUser.full_name,
          apellidos: editedUser.last_name,
          numero_telefono: editedUser.phone_number,
          genero: editedUser.gender,
          fecha_cumpleanos: editedUser.birth_date
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserData(editedUser);
        setIsEditing(false);
        showAlert('success', 'Éxito', 'Perfil actualizado correctamente');
      } else {
        showAlert('error', 'Error', data.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      showAlert('error', 'Error', 'Ocurrió un error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(userData);
    setIsEditing(false);
    setErrors({});
  };

  const handleChangeProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showAlert('error', 'Permiso requerido', 'Necesitamos permiso para acceder a tu galería');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageLoading(true);
      try {
        const formData = new FormData();
        formData.append('userId', userData.uid);
        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? result.assets[0].uri.replace('file://', '') : result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile_image.jpg'
        });
  
        const response = await fetch(`${API_URL}/api/update-profile-image`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        
        const data = await response.json();
        
        if (data.success && data.profile_image_url) {
          const updatedUser = { ...userData, profile_image: data.profile_image_url };
          setUserData(updatedUser);
          setEditedUser(updatedUser);
          showAlert('success', 'Éxito', 'Imagen de perfil actualizada correctamente');
        } else {
          throw new Error(data.message || 'No se pudo actualizar la imagen de perfil');
        }
      } catch (error) {
        console.error('Error al actualizar la imagen de perfil:', error);
        showAlert('error', 'Error', error.message || 'Ocurrió un error al actualizar la imagen de perfil');
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      handleFieldChange('birth_date', formattedDate);
    }
  };

  if (isLoading || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeProfileImage}>
              {userData.profile_image ? (
                <>
                  <Image
                    source={{ uri: userData.profile_image }}
                    style={styles.avatar}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                  />
                  {imageLoading && (
                    <View style={styles.imageLoadingContainer}>
                      <ActivityIndicator size="large" color="#333" />
                    </View>
                  )}
                </>
              ) : (
                <Ionicons name="person-circle-outline" size={80} color="#ffd1dc" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangeProfileImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{`${userData.full_name || ''} ${userData.last_name || ''}`}</Text>
          <Text style={styles.profession}>{userData.role || 'Cliente'}</Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          {isEditing ? (
            <>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={24} color="#333" />
                <TextInput
                  style={[styles.input, errors.full_name && styles.inputError]}
                  value={editedUser.full_name}
                  onChangeText={(text) => handleFieldChange('full_name', text)}
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}

              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={24} color="#333" />
                <TextInput
                  style={[styles.input, errors.last_name && styles.inputError]}
                  value={editedUser.last_name}
                  onChangeText={(text) => handleFieldChange('last_name', text)}
                  placeholder="Apellido"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
            </>
          ) : (
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.infoValue}>{`${userData.full_name || ''} ${userData.last_name || ''}`}</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color="#333" />
            <Text style={styles.infoValue}>{userData.email || 'No especificado'}</Text>
          </View>

          {isEditing ? (
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={24} color="#333" />
            <TextInput
              style={[styles.input, errors.phone_number && styles.inputError]}
              value={editedUser.phone_number}
              onChangeText={(text) => handleFieldChange('phone_number', text)}
              placeholder="Teléfono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        ) : (
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={24} color="#333" />
            <Text style={styles.infoValue}>{userData.phone_number || 'No especificado'}</Text>
          </View>
        )}
    {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number}</Text>}

    {isEditing ? (
      <View style={styles.infoItem}>
        <Ionicons name="calendar-outline" size={24} color="#333" />
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)} 
          style={[styles.datePickerButton, errors.birth_date && styles.inputError]}
        >
          <Text style={styles.datePickerText}>
            {editedUser.birth_date ? parseDate(editedUser.birth_date).toLocaleDateString() : 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={editedUser.birth_date ? parseDate(editedUser.birth_date) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
    ) : (
      <View style={styles.infoItem}>
        <Ionicons name="calendar-outline" size={24} color="#333" />
        <Text style={styles.infoValue}>
          {userData.birth_date ? parseDate(userData.birth_date).toLocaleDateString() : 'No especificado'}
        </Text>
      </View>
    )}
    {errors.birth_date && <Text style={styles.errorText}>{errors.birth_date}</Text>}

    {isEditing ? (
      <View style={styles.infoItem}>
        <Ionicons name="people-outline" size={24} color="#333" />
        <Picker
          selectedValue={editedUser.gender}
          style={[styles.picker, errors.gender && styles.pickerError]}
          onValueChange={(itemValue) => handleFieldChange('gender', itemValue)}
        >
          <Picker.Item label="Seleccionar género" value="" />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Femenino" value="Femenino" />
          <Picker.Item label="Otro" value="Otro" />
        </Picker>
      </View>
    ) : (
      <View style={styles.infoItem}>
        <Ionicons name="people-outline" size={24} color="#333" />
        <Text style={styles.infoValue}>{userData.gender || 'No especificado'}</Text>
      </View>
    )}
    {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
  </View>

  <CustomAlert
    isVisible={alertConfig.isVisible}
    type={alertConfig.type}
    title={alertConfig.title}
    message={alertConfig.message}
    buttons={alertConfig.buttons}
    onClose={hideAlert}
  />
</ScrollView>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
},
headerBar: {
flexDirection: 'row',
justifyContent: 'flex-end',
padding: 10,
backgroundColor: '#ffeef2',
},
logoutButton: {
padding: 5,
},
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
header: {
alignItems: 'center',
paddingVertical: 20,
backgroundColor: '#ffeef2',
},
avatarWrapper: {
width: 120,
height: 120,
marginBottom: 15,
position: 'relative',
},
avatarContainer: {
width: '100%',
height: '100%',
borderRadius: 60,
backgroundColor: '#f0f0f0',
justifyContent: 'center',
alignItems: 'center',
borderWidth: 3,
borderColor: '#ffd1dc',
overflow: 'hidden',
},
avatar: {
width: '100%',
height: '100%',
borderRadius: 60,
},
changePhotoButton: {
position: 'absolute',
bottom: 0,
right: 0,
backgroundColor: '#333',
padding: 8,
borderRadius: 20,
zIndex: 1,
},
name: {
fontSize: 24,
fontWeight: 'bold',
color: '#333',
marginBottom: 5,
},
profession: {
fontSize: 16,
color: '#666',
marginBottom: 15,
},
editButton: {
backgroundColor: '#333',
paddingHorizontal: 20,
paddingVertical: 10,
borderRadius: 25,
},
editButtonText: {
color: '#fff',
fontSize: 16,
fontWeight: '500',
},
editActions: {
flexDirection: 'row',
justifyContent: 'center',
marginTop: 15,
},
actionButton: {
backgroundColor: '#333',
padding: 10,
borderRadius: 25,
marginHorizontal: 10,
},
cancelButton: {
backgroundColor: '#666',
},
infoSection: {
padding: 20,
},
infoItem: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 20,
borderBottomWidth: 1,
borderBottomColor: '#f0f0f0',
paddingBottom: 10,
},
infoValue: {
flex: 1,
fontSize: 16,
color: '#333',
marginLeft: 15,
},
input: {
flex: 1,
fontSize: 16,
color: '#333',
marginLeft: 15,
padding: 8,
},
inputError: {
borderColor: 'red',
borderWidth: 1,
borderRadius: 5,
},
pickerError: {
borderColor: 'red',
borderWidth: 1,
borderRadius: 5,
},
datePickerButton: {
flex: 1,
marginLeft: 15,
padding: 8,
},
datePickerText: {
fontSize: 16,
color: '#333',
},
picker: {
flex: 1,
marginLeft: 15,
},
errorText: {
color: 'red',
fontSize: 12,
marginLeft: 39,
marginTop: -15,
marginBottom: 10,
},
imageLoadingContainer: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'rgba(255, 209, 220, 0.7)',
borderRadius: 60,
},
});

export default ProfileScreen;