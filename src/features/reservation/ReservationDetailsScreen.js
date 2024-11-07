import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  Image, 
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');

const ReservationDetailsScreen = ({ route, navigation }) => {
  const { reservation } = route.params;
  const [reservationData, setReservationData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    fetchReservationDetails();
  }, []);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.jaydey.com/ServicesMovil/api/reservation-details/${reservation.id}`
      );
      const data = await response.json();
      if (data.success) {
        setReservationData(data.data.reservation);
        setBusinessData(data.data.business);
      } else {
        Alert.alert('Error', 'No se pudo cargar la información de la reservación');
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      Alert.alert('Error', 'No se pudo cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch(status?.toLowerCase()) {
      case 'pendiente':
        return { icon: 'time', color: '#848483', text: 'Pendiente' };
      case 'aceptada':
        return { icon: 'checkmark-circle', color: '#4CAF50', text: 'Aceptada' };
      case 'rechazada':
        return { icon: 'close-circle', color: '#F44336', text: 'Rechazada' };
      case 'cancelada':
        return { icon: 'close-circle-outline', color: '#bf1e13', text: 'Cancelada' };
      case 'concluida':
        return { icon: 'checkmark', color: '#4CAF50', text: 'Concluido' };
      default:
        return { icon: 'help-circle-outline', color: '#9E9E9E', text: status };
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: mx});
    } catch (e) {
      return dateString;
    }
  };

  const handleCallBusiness = () => {
    if (businessData?.telefono) {
      Linking.openURL(`tel:${businessData.telefono}`);
    }
  };

  const handleWhatsApp = async () => {
    if (businessData?.telefono) {
      const whatsappNumber = businessData.telefono.replace(/\D/g, '');
      const message = 'Hola, me comunico por mi reservación...';
      
      try {
        // Primero intentamos abrir WhatsApp Web
        const webWhatsapp = `https://wa.me/52${whatsappNumber}?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webWhatsapp);
      } catch (err) {
        console.error('Error al abrir WhatsApp Web:', err);
        
        // Si falla WhatsApp Web, intentamos la app nativa
        try {
          const whatsappUrl = Platform.select({
            ios: `whatsapp://send?phone=52${whatsappNumber}&text=${encodeURIComponent(message)}`,
            android: `intent://send?phone=52${whatsappNumber}&text=${encodeURIComponent(message)}#Intent;package=com.whatsapp;scheme=whatsapp;end`
          });
          
          const canOpen = await Linking.canOpenURL(whatsappUrl);
          if (canOpen) {
            await Linking.openURL(whatsappUrl);
          } else {
            handleEmail(); // Fallback a email si no está disponible WhatsApp
          }
        } catch (error) {
          console.error('Error al abrir WhatsApp nativo:', error);
          handleEmail(); // Fallback a email si hay error
        }
      }
    }
  };

  const handleEmail = async () => {
    if (businessData?.correo) {
      const subject = 'Consulta sobre reservación';
      const body = 'Hola, me comunico por mi reservación...';
      const emailUrl = `mailto:${businessData.correo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      try {
        await Linking.openURL(emailUrl);
      } catch (error) {
        console.error('Error al abrir el correo:', error);
        Alert.alert(
          'Error',
          'No se pudo abrir el correo electrónico. Por favor, contacta directamente al correo: ' + businessData.correo,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleGetDirections = () => {
    if (businessData?.direccion) {
      const address = encodeURIComponent(businessData.direccion);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  if (loading || !reservationData || !businessData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  const statusInfo = getStatusInfo(reservationData.estado);

  return (
    <ScrollView style={styles.container}>
      {/* Service Title and Status */}
      <View style={styles.titleContainer}>
        <Text style={styles.serviceTitle}>{reservationData.tipo_de_servicio}</Text>
        <View style={styles.statusContainer}>
          <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Main Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FF69B4" />
            </View>
          )}
          {reservationData.imagen_url ? (
            <Image
              source={{
                uri: reservationData.imagen_url,
                headers: {
                  Accept: '*/*',
                }
              }}
              style={styles.mainImage}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                console.log('Error loading image');
              }}
            />
          ) : (
            <View style={[styles.mainImage, styles.placeholderContainer]}>
              <Ionicons name="image-outline" size={50} color="#666" />
            </View>
          )}
        </View>
      </View>

      {/* Business Info */}
      <View style={styles.businessContainer}>
        <View style={styles.businessHeader}>
          <View style={styles.businessLogoContainer}>
            {logoLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#FF69B4" />
              </View>
            )}
            <Image 
              source={{
                uri: businessData.logo_url,
                headers: {
                  Accept: '*/*',
                }
              }}
              style={styles.businessLogo}
              onLoadStart={() => setLogoLoading(true)}
              onLoadEnd={() => setLogoLoading(false)}
              onError={() => {
                setLogoLoading(false);
                console.log('Error loading business logo');
              }}
            />
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessData.nombre}</Text>
            <Text style={styles.businessAddress}>{businessData.direccion}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f0f0f0' }]} 
              onPress={handleCallBusiness}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={24} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f0f0f0' }]} 
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f0f0f0' }]} 
              onPress={handleGetDirections}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={24} color="#2196F3" />
              <Text style={styles.actionButtonText}>Ubicación</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f0f0f0' }]} 
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={24} color="#FF5722" />
              <Text style={styles.actionButtonText}>Correo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Appointment Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Detalles de la Cita</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={24} color="#666" />
          <Text style={styles.detailText}>{formatDate(reservationData.fecha)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={24} color="#666" />
          <Text style={styles.detailText}>{reservationData.hora_seleccionada}</Text>
        </View>
      </View>

      {/* Petición */}
      {reservationData.peticion && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tu Petición</Text>
          <Text style={styles.peticionText}>{reservationData.peticion}</Text>
        </View>
      )}

      {/* Comments */}
      {(reservationData.comentarios || reservationData.comentariosnego) && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Comentarios</Text>
          {reservationData.comentarios && (
            <View style={styles.commentContainer}>
              <Ionicons name="person-circle" size={24} color="#666" />
              <Text style={styles.commentText}>{reservationData.comentarios}</Text>
            </View>
          )}
          {reservationData.comentariosnego && (
            <View style={[styles.commentContainer, styles.businessComment]}>
              <Ionicons name="business" size={24} color="#666" />
              <Text style={styles.commentText}>{reservationData.comentariosnego}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageWrapper: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
    position: 'relative',
  },
  businessLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  actionButtonsContainer: {
    paddingHorizontal: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
},
actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
},
sectionContainer: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: '#F5F5F5',
},
sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
},
detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
},
detailText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
},
peticionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
},
commentContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
},
businessComment: {
    backgroundColor: '#FFF9C4',
},
commentText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
}
});

export default ReservationDetailsScreen;