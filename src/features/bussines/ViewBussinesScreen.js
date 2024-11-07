import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Dimensions, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ImageCarousel = ({ images, imageHeight = 300 }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const renderImage = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedImage(item)}>
      <Image 
        source={{ uri: item }} 
        style={[styles.carouselImage, { height: imageHeight }]}
      />
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        data={images}
        renderItem={renderImage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        snapToInterval={width}
        decelerationRate="fast"
        snapToAlignment="start"
      />
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
};

const ServiceImages = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const renderServiceImage = ({ item, index }) => (
    <TouchableOpacity 
      onPress={() => setSelectedImage(item)}
      style={[
        styles.serviceImageContainer,
        index % 3 === 2 ? styles.serviceImageContainerRight : null
      ]}
    >
      <Image 
        source={{ uri: item }} 
        style={styles.serviceImage}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.serviceImagesWrapper}>
      <FlatList
        data={images}
        renderItem={renderServiceImage}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.serviceImagesContainer}
      />
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
};

const PromotionItem = ({ promotion }) => {
  const startDate = new Date(promotion.fecha_inicio);
  const endDate = new Date(promotion.fecha_fin);

  return (
    <View style={styles.promotionItem}>
      <Text style={styles.promotionTitle}>{promotion.descripcion}</Text>
      <Text style={styles.promotionDiscount}>{promotion.porcentaje_descuento}% de descuento</Text>
      <Text style={styles.promotionDates}>
        Desde: {startDate.toLocaleString()} - Hasta: {endDate.toLocaleString()}
      </Text>
    </View>
  );
};

const ViewBussinesScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`https://www.jaydey.com/ServicesMovil/api/business/${businessId}`);
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

  const handleWhatsApp = () => {
    if (business && business.phone_number) {
      const whatsappNumber = business.phone_number.replace(/[^\d]/g, '');
      Linking.openURL(`whatsapp://send?phone=${whatsappNumber}`);
    }
  };

  const handleOpenGoogleMaps = () => {
    if (business && business.plus_code) {
      const locationQuery = encodeURIComponent(business.plus_code);
      const url = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
      
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("No se puede abrir Google Maps");
        }
      }).catch(err => console.error('Error al abrir Google Maps:', err));
    }
  };

  const calculateRating = (likes, dislikes) => {
    const total = likes + dislikes;
    if (total === 0) return 0;
    return ((likes / total) * 5).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "No se pudieron cargar los detalles del negocio."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBusinessDetails}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.header}>
            <ImageCarousel images={business.business_images || []} imageHeight={300} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />
            <View style={styles.headerContent}>
              <Text style={styles.title}>{business.business_name}</Text>
              <View style={styles.profileContainer}>
                <Image
                  source={{ uri: business.profile_image }}
                  style={styles.profileImage}
                />
                <Text style={styles.profileName}>{business.owner_name}</Text>
              </View>
            </View>
          </View>
        );
        case 'stats':
          const rating = calculateRating(
            business.numero_gustas || 0, 
            business.no_me_gustas || 0
          );
        return (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{rating}</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={24} color="#FF4500" />
              <Text style={styles.statValue}>{business.numero_gustas || 0}</Text>
              <Text style={styles.statLabel}>Me gusta</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-dislike" size={24} color="#FF4500" />
              <Text style={styles.statValue}>{business.no_me_gustas || 0}</Text>
              <Text style={styles.statLabel}>No me gusta</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={24} color="#4169E1" />
              <Text style={styles.statValue}>{business.numero_resenas || 0}</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </View>
          </View>
        );
      case 'services':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Ofrecidos</Text>
            {business.services_offered && business.services_offered.length > 0 && (
              <ServiceImages images={business.services_offered} />
            )}
          </View>
        );
      case 'promotions':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promociones</Text>
            {business.promotions && business.promotions.length > 0 ? (
              business.promotions.map((promotion, index) => (
                <PromotionItem key={index} promotion={promotion} />
              ))
            ) : (
              <Text style={styles.noPromotionsText}>No hay promociones disponibles. Habrá próximamente.</Text>
            )}
          </View>
        );
        case 'contact':
          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de Contacto</Text>
              <TouchableOpacity style={styles.contactItem} onPress={handlePhoneCall}>
                <Ionicons name="call-outline" size={24} color="#007AFF" />
                <Text style={styles.contactText}>{business.phone_number}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={styles.contactText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={24} color="#007AFF" />
                <Text style={styles.contactText}>{business.email}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={handleOpenGoogleMaps}>
                <Ionicons name="location-outline" size={24} color="#007AFF" />
                <Text style={styles.contactText}>{business.business_address}</Text>
              </TouchableOpacity>
            </View>
          );
          case 'hours':
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Horario de Atención</Text>
                <View style={styles.hoursContainer}>
                  {business.opening_hours?.turno_1 && (
                    <View style={styles.hourItem}>
                      <Ionicons name="time-outline" size={24} color="#007AFF" />
                      <View style={styles.hourTextContainer}>
                        <Text style={styles.hourTitle}>Primer Turno</Text>
                        <Text style={styles.hourText}>{business.opening_hours.turno_1}</Text>
                      </View>
                    </View>
                  )}
                  {business.opening_hours?.turno_2 && (
                    <View style={styles.hourItem}>
                      <Ionicons name="time-outline" size={24} color="#007AFF" />
                      <View style={styles.hourTextContainer}>
                        <Text style={styles.hourTitle}>Segundo Turno</Text>
                        <Text style={styles.hourText}>{business.opening_hours.turno_2}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
      case 'reserve':
        return (
          <TouchableOpacity 
            style={styles.reserveButton}
            onPress={() => navigation.navigate('Reservation', { businessId: business.id })}
          >
            <Text style={styles.reserveButtonText}>Reservar Cita</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const sections = [
    { type: 'header' },
    { type: 'stats' },
    { type: 'services' },
    { type: 'promotions' },
    { type: 'contact' },
    { type: 'hours' },
    { type: 'reviews' },
    { type: 'location' },
    { type: 'reserve' },
  ];

  return (
    <FlatList
      data={sections}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.type}
      style={styles.container}
    />
  );
};

export default ViewBussinesScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 300,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewerName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewText: {
    fontStyle: 'italic',
    color: '#555',
  },
  noReviewsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
  map: {
    height: 200,
    marginTop: 10,
  },
  reserveButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    margin: 20,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    resizeMode: 'cover',
  },
  serviceImagesWrapper: {
    paddingHorizontal: 10,
  },
  serviceImagesContainer: {
    paddingVertical: 5,
  },
  serviceImageContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 5,
  },
  serviceImageContainerRight: {
    paddingRight: 0,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  modalView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  promotionItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promotionDiscount: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  promotionDates: {
    fontSize: 12,
    color: '#666',
  },
  noPromotionsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
  
  hoursContainer: {
    backgroundColor: '#f8f8f8',
  },
  hourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    },
  hourTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  hourTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hourText: {
    fontSize: 15,
    color: '#666',
  },
});