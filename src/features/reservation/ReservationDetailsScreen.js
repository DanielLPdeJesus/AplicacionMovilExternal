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
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReservationDetailsScreen = ({ route, navigation }) => {
  const { reservation } = route.params;
  const [reservationData, setReservationData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const handleCallBusiness = () => {
    if (businessData?.telefono) {
      Linking.openURL(`tel:${businessData.telefono}`);
    }
  };

  const handleWhatsApp = () => {
    if (businessData?.telefono) {
      const whatsappNumber = businessData.telefono.replace(/\D/g, '');
      const whatsappUrl = `whatsapp://send?phone=52${whatsappNumber}`;
      
      Linking.canOpenURL(whatsappUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            Alert.alert(
              'Error',
              'WhatsApp no está instalado en este dispositivo',
              [{ text: 'OK' }]
            );
          }
        })
        .catch(err => {
          console.error('Error al abrir WhatsApp:', err);
          Alert.alert('Error', 'No se pudo abrir WhatsApp');
        });
    }
  };

  const handleEmail = () => {
    if (businessData?.correo) {
      const emailUrl = `mailto:${businessData.correo}`;
      Linking.canOpenURL(emailUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(emailUrl);
          } else {
            Alert.alert(
              'Error',
              'No hay aplicación de correo configurada',
              [{ text: 'OK' }]
            );
          }
        })
        .catch(err => {
          console.error('Error al abrir el correo:', err);
          Alert.alert('Error', 'No se pudo abrir el correo');
        });
    }
  };

  const handleGetDirections = () => {
    if (businessData?.direccion) {
      const address = encodeURIComponent(businessData.direccion);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  const handleCancelReservation = async () => {
    Alert.alert(
      "Cancelar Reservación",
      "¿Estás seguro que deseas cancelar esta reservación?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `https://www.jaydey.com/ServicesMovil/api/cancel-reservation/${reservationData.id}`,
                { 
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
              const data = await response.json();
              if (data.success) {
                Alert.alert("Éxito", "La reservación ha sido cancelada",
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert("Error", data.message || "No se pudo cancelar la reservación");
              }
            } catch (error) {
              console.error('Error canceling reservation:', error);
              Alert.alert("Error", "Hubo un problema al cancelar la reservación");
            }
          }
        }
      ]
    );
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
        <Image
          source={{ uri: reservationData.imagen_url }}
          style={styles.mainImage}
          defaultSource={require('../../../assets/iconresulocion.png')}
        />
      </View>

      {/* Business Info */}
      <View style={styles.businessContainer}>
        <View style={styles.businessHeader}>
          <Image 
            source={{ uri: businessData.logo_url }}
            style={styles.businessLogo}
            defaultSource={require('../../../assets/iconresulocion.png')}
          />
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessData.nombre}</Text>
            <Text style={styles.businessAddress}>{businessData.direccion}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallBusiness}>
              <Ionicons name="call" size={24} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
              <Ionicons name="location" size={24} color="#2196F3" />
              <Text style={styles.actionButtonText}>Ubicación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
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

      {/* Cancel Button */}
      {reservationData.estado === 'pendiente' && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelReservation}
        >
          <Ionicons name="close-circle" size={24} color="#FFF" />
          <Text style={styles.cancelButtonText}>Cancelar Reservación</Text>
        </TouchableOpacity>
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
  },
  mainImage: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  businessContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  },
  detailText: {
    fontSize: 16,
    color: '#444',
  },
  peticionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  commentContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  businessComment: {
    backgroundColor: '#FFF9C4',
  },
  commentText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReservationDetailsScreen;