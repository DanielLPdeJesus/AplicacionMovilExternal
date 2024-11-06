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
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.jaydey.com/ServicesMovil/api/business/${reservation.id_negocio}`
      );
      const data = await response.json();
      if (data.success) {
        setBusinessData(data.business);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del negocio');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch(status.toLowerCase()) {
      case 'pendiente':
        return { icon: 'time', color: '#848483', text: 'Pendiente' };
      case 'aceptado':
        return { icon: 'checkmark-circle', color: '#4CAF50', text: 'Aprobado' };
      case 'rechazado':
        return { icon: 'close-circle', color: '#F44336', text: 'Rechazado' };
      case 'cancelado':
        return { icon: 'close-circle-outline', color: '#bf1e13', text: 'Cancelado' };
      case 'concluido':
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
                `https://www.jaydey.com/ServicesMovil/api/cancel-reservation/${reservation.id}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' } }
              );
              const data = await response.json();
              if (data.success) {
                Alert.alert("Éxito", "La reservación ha sido cancelada",
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert("Error", "No se pudo cancelar la reservación");
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  const statusInfo = getStatusInfo(reservation.estado);

  return (
    <ScrollView style={styles.container}>
      {/* Service Title and Status */}
      <View style={styles.titleContainer}>
        <Text style={styles.serviceTitle}>{reservation.tipo_de_servicio}</Text>
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
          source={{ uri: reservation.imagen_url }}
          style={styles.mainImage}
          defaultSource={require('../../../assets/iconresulocion.png')}
        />
      </View>

      {/* Business Info */}
      {businessData && (
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
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallBusiness}>
              <Ionicons name="call" size={24} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
              <Ionicons name="location" size={24} color="#2196F3" />
              <Text style={styles.actionButtonText}>Ver ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Appointment Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Detalles de la Cita</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={24} color="#666" />
          <Text style={styles.detailText}>{formatDate(reservation.fecha)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={24} color="#666" />
          <Text style={styles.detailText}>{reservation.hora_seleccionada}</Text>
        </View>
      </View>

      {/* Petición */}
      {reservation.peticion && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tu Petición</Text>
          <Text style={styles.peticionText}>{reservation.peticion}</Text>
        </View>
      )}

      {/* Comments */}
      {(reservation.comentarios || reservation.comentariosnego) && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Comentarios</Text>
          {reservation.comentarios && (
            <View style={styles.commentContainer}>
              <Ionicons name="person-circle" size={24} color="#666" />
              <Text style={styles.commentText}>{reservation.comentarios}</Text>
            </View>
          )}
          {reservation.comentariosnego && (
            <View style={[styles.commentContainer, styles.businessComment]}>
              <Ionicons name="business" size={24} color="#666" />
              <Text style={styles.commentText}>{reservation.comentariosnego}</Text>
            </View>
          )}
        </View>
      )}

      {/* Cancel Button */}
      {reservation.estado === 'pendiente' && (
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
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