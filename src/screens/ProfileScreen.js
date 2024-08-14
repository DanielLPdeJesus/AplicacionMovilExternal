import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkAuth } from '../utils/authUtils'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const verifyAuthAndLoadData = async () => {
      const { isAuthenticated, user } = await checkAuth();
      if (!isAuthenticated) {
        navigation.replace('Login');
      } else {
        setUserData(user);
        setIsLoading(false);
      }
    };

    verifyAuthAndLoadData();
  }, [navigation, route.params]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userSession');
      navigation.replace('HomeTabs');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: userData.profile_image }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{`${userData.full_name} ${userData.last_name}`}</Text>
          <Text style={styles.profession}>{userData.role}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <TouchableOpacity style={styles.editInfoButton}>
          <Text style={styles.editInfoText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoItem}>
        <Ionicons name="happy-outline" size={24} color="#888" />
        <Text style={styles.infoLabel}>Nombre de Usuario</Text>
        <Text style={styles.infoValue}>{userData.full_name}</Text>
      </View>

      <View style={styles.infoItem}>
        <Ionicons name="mail-outline" size={24} color="#888" />
        <Text style={styles.infoLabel}>Correo</Text>
        <Text style={styles.infoValue}>{userData.email}</Text>
      </View>

      <View style={styles.infoItem}>
        <Ionicons name="call-outline" size={24} color="#888" />
        <Text style={styles.infoLabel}>Teléfono</Text>
        <Text style={styles.infoValue}>{userData.phone_number}</Text>
      </View>

      <View style={styles.infoItem}>
        <Ionicons name="calendar-outline" size={24} color="#888" />
        <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
        <Text style={styles.infoValue}>{new Date(userData.birth_date).toLocaleDateString()}</Text>
      </View>

      <View style={styles.infoItem}>
        <Ionicons name="people-outline" size={24} color="#888" />
        <Text style={styles.infoLabel}>Género</Text>
        <Text style={styles.infoValue}>{userData.gender}</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
  editInfoButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
  },
  editInfoText: {
    fontSize: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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