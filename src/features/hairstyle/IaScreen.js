import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AntDesign } from '@expo/vector-icons';

const estilos = [
  { id: '1', name: 'Buzz Cut', description: 'Corte muy corto y uniforme en toda la cabeza', image: require('../../../assets/buzzcut.jpg') },
  { id: '2', name: 'Under Cut', description: 'Lados y parte trasera rapados con pelo más largo arriba', image: require('../../../assets/logodani.jpg') },
];

function GaleriaEstilos({ navigation }) {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a la galería');
      }
    })();
  }, []);

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
      alert('Error al seleccionar la imagen');
    }
  };

  const handleStylePress = (style) => {
    pickImage(style);
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setSelectedStyle(null);
    setShowPreview(false);
  };

  const handleProbarCorte = () => {
    navigation.navigate('PruebaEstilo', {
      photo: selectedImage,
      style: selectedStyle
    });
    setShowPreview(false);
  };

  const PreviewModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPreview}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedStyle?.name}</Text>
          
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
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleProbarCorte}
            >
              <Text style={styles.confirmButtonText}>Probar Corte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => handleStylePress(item)}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avisoContainer}>
        <Text style={styles.avisoTitle}>Aviso</Text>
        <Text style={styles.avisoText}>Prueba los Diseños con IA</Text>
        <Text style={styles.avisoSubtext}>Dele click al nombre del corte y suba una foto suya...</Text>
      </View>

      <Text style={styles.sectionTitle}>Cortes Bonitos</Text>

      <FlatList
        data={estilos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <PreviewModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
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
});

export default GaleriaEstilos;