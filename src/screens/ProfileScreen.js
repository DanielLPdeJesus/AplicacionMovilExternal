import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'https://www.jaydey.com/ServicesMovil'; 

const ProfileScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    } else {
      setUserData(user);
      setEditedUser(user);
      setIsLoading(false);
    }
  }, [isLoggedIn, user, navigation]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigation.replace('HomeTabs');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.uid,
          ...editedUser
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserData(editedUser);
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(userData);
    setIsEditing(false);
  };

  const handleChangeProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos permiso para acceder a tu galería');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      setIsLoading(true);
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
          Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente');
        } else {
          throw new Error(data.message || 'No se pudo actualizar la imagen de perfil');
        }
      } catch (error) {
        console.error('Error al actualizar la imagen de perfil:', error);
        Alert.alert('Error', error.message || 'Ocurrió un error al actualizar la imagen de perfil');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedUser({...editedUser, birth_date: selectedDate.toISOString().split('T')[0]});
    }
  };

  if (isLoading || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeProfileImage}>
        {userData.profile_image ? (
          <Image
            source={{ uri: userData.profile_image }}
            style={styles.avatar}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={60} color="#888" />
        )}
        <View style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>Cambiar</Text>
        </View>
  </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.name}>{`${userData.full_name || ''} ${userData.last_name || ''}`}</Text>
          <Text style={styles.profession}>{userData.role || 'No role specified'}</Text>
        </View>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
      </View>

      {isEditing ? (
        <>
          <View style={styles.infoItem}>
            <Ionicons name="happy-outline" size={24} color="#888" />
            <Text style={styles.infoLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={editedUser.full_name}
              onChangeText={(text) => setEditedUser({...editedUser, full_name: text})}
            />
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="happy-outline" size={24} color="#888" />
            <Text style={styles.infoLabel}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={editedUser.last_name}
              onChangeText={(text) => setEditedUser({...editedUser, last_name: text})}
            />
          </View>
        </>
      ) : (
        <View style={styles.infoItem}>
          <Ionicons name="happy-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Nombre de Usuario</Text>
          <Text style={styles.infoValue}>{`${userData.full_name || ''} ${userData.last_name || ''}`}</Text>
        </View>
      )}

      <View style={styles.infoItem}>
        <Ionicons name="mail-outline" size={24} color="#888" />
        <Text style={styles.infoLabel}>Correo</Text>
        <Text style={styles.infoValue}>{userData.email || 'No especificado'}</Text>
      </View>

      {isEditing ? (
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={editedUser.phone_number}
            onChangeText={(text) => setEditedUser({...editedUser, phone_number: text})}
            keyboardType="phone-pad"
          />
        </View>
      ) : (
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Teléfono</Text>
          <Text style={styles.infoValue}>{userData.phone_number || 'No especificado'}</Text>
        </View>
      )}

      {isEditing ? (
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.input}>{editedUser.birth_date || 'Seleccionar fecha'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={editedUser.birth_date ? new Date(editedUser.birth_date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      ) : (
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
          <Text style={styles.infoValue}>
            {userData.birth_date ? new Date(userData.birth_date).toLocaleDateString() : 'No especificado'}
          </Text>
        </View>
      )}

      {isEditing ? (
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Género</Text>
          <Picker
            selectedValue={editedUser.gender}
            style={styles.input}
            onValueChange={(itemValue) => setEditedUser({...editedUser, gender: itemValue})}
          >
            <Picker.Item label="Seleccionar" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="Otro" value="Otro" />
          </Picker>
        </View>
      ) : (
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={24} color="#888" />
          <Text style={styles.infoLabel}>Género</Text>
          <Text style={styles.infoValue}>{userData.gender || 'No especificado'}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 10,
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profession: {
    fontSize: 14,
    color: '#888',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
  },
  editButtonText: {
    fontSize: 12,
  },
  editActions: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#888',
  },
  input: {
    flex: 2,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;