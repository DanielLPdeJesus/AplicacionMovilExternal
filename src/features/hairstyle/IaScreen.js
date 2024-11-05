import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const FLASK_API_URL = 'https://www.jaydey.com/ServicesMovil';

const estilos = [
  { 
    id: '1', 
    name: 'BuzzCut',
    displayName: 'Buzz Cut',
    description: 'Corte muy corto y uniforme en toda la cabeza',
    image: require('../../../assets/buzzcut.jpg') 
  },
  { 
    id: '2', 
    name: 'ManBun',
    displayName: 'Man Bun',
    description: 'Recogido en moño en la parte trasera',
    image: require('../../../assets/logodani.jpg') 
  },
  { 
    id: '3', 
    name: 'Undercut',
    displayName: 'Under Cut',
    description: 'Lados y parte trasera rapados con pelo largo arriba',
    image: require('../../../assets/logodani.jpg') 
  }
];

function IaScreen() {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesitan permisos para acceder a la galería');
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  };

  const resizeImage = async (imageUri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 2000,
              height: 2000,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult;
    } catch (error) {
      console.error('Error al redimensionar la imagen:', error);
      throw error;
    }
  };

  const pickImage = async (style) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const resizedImage = await resizeImage(result.assets[0].uri);
        setSelectedImage(resizedImage);
        setSelectedStyle(style);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const processImage = async () => {
    if (!selectedImage || !selectedStyle) return;

    setIsProcessing(true);
    setShowPreview(false);

    try {
      console.log('Preparando imagen para procesar:', selectedImage.uri);
      
      const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
      if (!fileInfo.exists) {
        throw new Error('El archivo de imagen no existe');
      }

      const base64Image = await FileSystem.readAsStringAsync(selectedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        image: `data:image/jpeg;base64,${base64Image}`,
        hair_style: selectedStyle.name,
        userId: user?.uid || 'anonymous'
      };

      console.log('Enviando request con estilo:', selectedStyle.name);
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${FLASK_API_URL}/api/process-hairstyle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('Respuesta completa del servidor:', responseText);

      const data = JSON.parse(responseText);

      if (!data.success) {
        throw new Error(data.message || 'Error en la respuesta del servidor');
      }

      await checkProcessingStatus(data.task_id);

    } catch (error) {
      console.error('Error detallado en processImage:', error);
      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error al procesar la imagen',
        [{ text: 'Entendido' }]
      );
      setIsProcessing(false);
    }
  };

  const checkProcessingStatus = async (taskId) => {
    try {
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        console.log(`Verificando estado: intento ${attempts + 1}`);
        
        const response = await fetch(`${FLASK_API_URL}/api/check-hairstyle-status/${taskId}`);
        const data = await response.json();

        if (data.task_status === 2 && data.firebase_url) {
          setProcessedImage(data.firebase_url);
          setIsProcessing(false);
          break;
        } else if (data.task_status === 0 || data.task_status === 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
        } else {
          throw new Error('Estado de procesamiento inválido');
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error('Tiempo de procesamiento excedido');
      }
    } catch (error) {
      console.error('Error en checkProcessingStatus:', error);
      Alert.alert('Error', 'No se pudo completar el procesamiento');
      setIsProcessing(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => pickImage(item)}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>
          Procesando imagen...{'\n'}Esto puede tomar unos minutos
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avisoContainer}>
        <Text style={styles.avisoTitle}>Aviso</Text>
        <Text style={styles.avisoText}>Prueba los Diseños con IA</Text>
        <Text style={styles.avisoSubtext}>
          Dale click al nombre del corte y suba una foto suya...
        </Text>
      </View>

      {!processedImage ? (
        <>
          <Text style={styles.sectionTitle}>Cortes Bonitos</Text>
          <FlatList
            data={estilos}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado</Text>
          <View style={styles.imagesContainer}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.resultImage}
            />
            <Image 
              source={{ uri: processedImage }} 
              style={styles.resultImage}
            />
          </View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setProcessedImage(null);
              setSelectedImage(null);
              setSelectedStyle(null);
            }}
          >
            <Text style={styles.backButtonText}>Probar Otro Estilo</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPreview}
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedStyle?.displayName}</Text>
            
            <Image 
              source={{ uri: selectedImage?.uri }} 
              style={styles.previewImage}
            />
            
            <Text style={styles.modalDescription}>
              {selectedStyle?.description}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPreview(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={processImage}
              >
                <Text style={styles.confirmButtonText}>Procesar Imagen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  avisoContainer: {
    backgroundColor: '#f8f8f8',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avisoTitle: {
    fontSize: 14,
    color: '#666',
  },
  avisoText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  avisoSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    margin: 16,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultImage: {
    width: '45%',
    height: 300,
    borderRadius: 10,
  },
  backButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IaScreen;
