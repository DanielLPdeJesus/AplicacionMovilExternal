import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkAuth = async () => {
  try {
    const sessionData = await AsyncStorage.getItem('userSession');
    if (sessionData) {
      const { id_token, user } = JSON.parse(sessionData);
      return { isAuthenticated: true, user };
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error al verificar la autenticación:', error);
    return { isAuthenticated: false };
  }
};