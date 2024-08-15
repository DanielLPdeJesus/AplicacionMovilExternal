import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        const { id_token, user } = JSON.parse(sessionData);
        if (id_token && user) {
          setIsLoggedIn(true);
          setUser(user);
        }
      }
    } catch (error) {
      console.error('Error al verificar el estado de autenticación:', error);
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
      setIsLoggedIn(true);
      setUser(userData.user);
    } catch (error) {
      console.error('Error al guardar la sesión:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);