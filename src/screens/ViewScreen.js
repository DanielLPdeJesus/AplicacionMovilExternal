import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,  Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const ViewScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`https://jaydey.pythonanywhere.com/ServicesMovil/api/business/${businessId}`);
      const data = await response.json();
      if (data.success) {
        setBusiness(data.business);
      } else {
        setError(data.message || 'Error desconocido al obtener los detalles del negocio');
        console.error('Error from server:', data);
      }
    } catch (error) {
      setError('Error de red al obtener los detalles del negocio');
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = () => {
    if (business && business.phone_number) {
      Linking.openURL(`tel:${business.phone_number}`);
    }
  };

  const handleEmail = () => {
    if (business && business.email) {
      Linking.openURL(`mailto:${business.email}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBusinessDetails}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los detalles del negocio.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>{business.business_name}</Text>
      
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: business.profile_image }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{business.owner_name}</Text>
      </View>
      
      {business.business_images && business.business_images.length > 0 && (
        <Image
          source={{ uri: business.business_images[0] }}
          style={styles.salonImage}
        />
      )}
     
      
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Servicios Ofrecidos</Text>
        {business.services_offered && business.services_offered.length > 0 && (
        <Image
          source={{ uri: business.services_offered[1] }}
          style={styles.salonImage}
        />
      )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        <Text style={styles.infoText}>Dirección: {business.business_address}</Text>
        <TouchableOpacity onPress={handlePhoneCall}>
          <Text style={[styles.infoText, styles.linkText]}>Teléfono: {business.phone_number}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEmail}>
          <Text style={[styles.infoText, styles.linkText]}>Email: {business.email}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statText}>Calificación: {business.calificacion_promedio.toFixed(1)}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={20} color="#FF4500" />
          <Text style={styles.statText}>Me gusta: {business.numero_gustas}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={20} color="#4169E1" />
          <Text style={styles.statText}>Reseñas: {business.numero_resenas}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Reseñas</Text>
        {business.reviews && business.reviews.length > 0 ? (
          business.reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <Text style={styles.reviewerName}>{review.user_name}</Text>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>{business.no_reviews_message || "No hay reseñas disponibles."}</Text>
        )}
      </View>
      
      {business.latitude && business.longitude && (
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: business.latitude,
              longitude: business.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{ latitude: business.latitude, longitude: business.longitude }}
              title={business.business_name}
            />
          </MapView>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.blackButton]}
          onPress={() => navigation.navigate('Reservation', { businessId: business.id })}
        >
          <Text style={[styles.buttonText, styles.whiteText]}>Reservar Cita</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  salonImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  linkText: {
    color: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginTop: 5,
  },
  reviewItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  reviewerName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewText: {
    fontStyle: 'italic',
  },
  noReviewsText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mapContainer: {
    padding: 20,
  },
  map: {
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  blackButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  whiteText: {
    color: '#fff',
  },
});

export default ViewScreen;