import React, { useState, useEffect } from "react";
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
  Alert,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { useAuth } from "../../context/AuthContext";
import { hairstyles } from "../../data/hairstyle";
import NoAuthScreen from '../../components/common/NotAuthScreen';

const FLASK_API_URL = "https://www.jaydey.com/ServicesMovil";
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function IaScreen({ navigation }) {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    requestPermissions();
  }, []);

 
  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Se necesitan permisos para acceder a la galería"
        );
      }
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
    }
  };

  const resizeImage = async (imageUri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 2000, height: 2000 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult;
    } catch (error) {
      console.error("Error al redimensionar la imagen:", error);
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
      console.error("Error al seleccionar la imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const checkProcessingStatus = async (taskId) => {
    try {
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const response = await fetch(
          `${FLASK_API_URL}/api/check-hairstyle-status/${taskId}`
        );
        const data = JSON.parse(await response.text());

        if (data.error || data.message?.toLowerCase().includes("error")) {
          throw new Error("INVALID_IMAGE");
        }

        if (data.task_status === 2 && data.firebase_url) {
          setProcessedImage(data.firebase_url);
          setIsProcessing(false);
          break;
        } else if (data.task_status === 0 || data.task_status === 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          attempts++;
        } else if (data.task_status === -1 || data.task_status === 3) {
          throw new Error("INVALID_IMAGE");
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error("TIMEOUT");
      }
    } catch (error) {
      handleProcessingError(error);
    }
  };

  const handleProcessingError = (error) => {
    let errorMessage = "No se pudo completar el procesamiento";
    let errorTitle = "Error";

    if (error.message === "INVALID_IMAGE") {
      errorTitle = "Lo sentimos";
      errorMessage =
        "Su imagen no es válida para procesar. Por favor, asegúrese de que la foto muestre claramente su rostro y vuelva a intentarlo.";
    } else if (error.message === "TIMEOUT") {
      errorMessage =
        "El procesamiento está tomando demasiado tiempo. Por favor, intente nuevamente.";
    }

    Alert.alert(errorTitle, errorMessage, [
      {
        text: "Reintentar",
        onPress: () => {
          setIsProcessing(false);
          setShowPreview(true);
        },
      },
      {
        text: "Cancelar",
        style: "cancel",
        onPress: resetState,
      },
    ]);
  };

  const resetState = () => {
    setIsProcessing(false);
    setShowPreview(false);
    setSelectedImage(null);
    setSelectedStyle(null);
    setProcessedImage(null);
  };

  const processImage = async () => {
    if (!selectedImage || !selectedStyle) return;

    setIsProcessing(true);
    setShowPreview(false);

    try {
      const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
      if (!fileInfo.exists) {
        throw new Error("IMAGE_NOT_FOUND");
      }

      const base64Image = await FileSystem.readAsStringAsync(selectedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        image: `data:image/jpeg;base64,${base64Image}`,
        hair_style: selectedStyle.name,
        userId: user?.uid || "anonymous",
      };

      const response = await fetch(`${FLASK_API_URL}/api/process-hairstyle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = JSON.parse(await response.text());

      if (!data.success || !data.task_id) {
        throw new Error("INVALID_REQUEST");
      }

      await checkProcessingStatus(data.task_id);
    } catch (error) {
      handleProcessingError(error);
    }
  };

  const handleImagePress = (imageUri) => {
    setZoomImage(imageUri);
    setShowZoomModal(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => pickImage(item)}
    >
      <TouchableOpacity onPress={() => handleImagePress(item.image)}>
        <Image source={item.image} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user?.uid) {
    return <NoAuthScreen navigation={navigation} />;
  }

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.processingTitle}>Procesando imagen...</Text>
        <Text style={styles.processingText}>
          Espere un momento{'\n'}
          Disculpe la demora
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
            data={hairstyles}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado</Text>
          <View style={styles.imagesContainer}>
            <TouchableOpacity 
              style={styles.resultImageContainer}
              onPress={() => handleImagePress(selectedImage.uri)}
            >
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.resultImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resultImageContainer}
              onPress={() => handleImagePress(processedImage)}
            >
              <Image
                source={{ uri: processedImage }}
                style={styles.resultImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={resetState}
          >
            <Text style={styles.backButtonText}>Probar Otro Estilo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preview Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPreview}
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedStyle?.displayName}</Text>

            <TouchableOpacity onPress={() => handleImagePress(selectedImage?.uri)}>
              <Image
                source={{ uri: selectedImage?.uri }}
                style={styles.previewImage}
              />
            </TouchableOpacity>

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

      {/* Zoom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showZoomModal}
        onRequestClose={() => setShowZoomModal(false)}
      >
        <TouchableOpacity 
          style={styles.zoomModalContainer}
          activeOpacity={1}
          onPress={() => setShowZoomModal(false)}
        >
          <Image
            source={typeof zoomImage === 'string' ? { uri: zoomImage } : zoomImage}
            style={styles.zoomImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#000",
  },
  processingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
  },
  avisoContainer: {
    backgroundColor: "#f8f8f8",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avisoTitle: {
    fontSize: 14,
    color: "#666",
  },
  avisoText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  avisoSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    margin: 16,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginRight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f8f8",
  },
  confirmButton: {
    backgroundColor: "#000",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  imagesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  resultImageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  backButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: windowWidth,
    height: windowHeight * 0.8,
  },
});

export default IaScreen;